import FormData from "form-data";
import fetch from "node-fetch";

const CATBOX_USERHASH = "anonymous";
const IMGBB_KEY = "eb6002b5f8d3e3f209833e690ea0684d";

// ------------------------
// 1) direct upload to trace.moe
// ------------------------
async function tryTraceMoeFile(buffer) {
  try {
    const form = new FormData();
    form.append("image", buffer, "image.jpg");

    const resp = await fetch("https://api.trace.moe/search", {
      method: "POST",
      body: form
    });

    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

// ------------------------
// 2) catbox upload
// ------------------------
async function tryCatbox(buffer) {
  try {
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("userhash", CATBOX_USERHASH);
    form.append("fileToUpload", buffer, "image.jpg");

    const resp = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: form
    });

    const url = await resp.text();
    return url.startsWith("http") ? url : null;
  } catch {
    return null;
  }
}

// ------------------------
// 3) imgbb upload
// ------------------------
async function tryImgbb(buffer) {
  try {
    const form = new FormData();
    form.append("image", buffer.toString("base64"));

    const resp = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
      { method: "POST", body: form }
    );

    const json = await resp.json();
    return json.success ? json.data.url : null;
  } catch {
    return null;
  }
}

// ------------------------
// 4) trace by url
// ------------------------
async function traceMoeByUrl(url) {
  try {
    const resp = await fetch(
      `https://api.trace.moe/search?url=${encodeURIComponent(url)}`
    );

    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

// ------------------------
// 5) main vercel handler
// ------------------------
export const config = {
  api: {
    bodyParser: false, // важно!
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Only POST allowed" });

  // читаем бинарный файл вручную
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  if (!buffer.length)
    return res.json({ error: "No file uploaded" });

  // ---------- 1: trace direct ----------
  let data = await tryTraceMoeFile(buffer);
  if (data?.result?.length) return res.json(data);

  // ---------- 2: Catbox ----------
  let url = await tryCatbox(buffer);
  if (url) {
    data = await traceMoeByUrl(url);
    if (data?.result?.length) return res.json(data);
  }

  // ---------- 3: ImgBB ----------
  url = await tryImgbb(buffer);
  if (url) {
    data = await traceMoeByUrl(url);
    if (data?.result?.length) return res.json(data);
  }

  // ---------- fail ----------
  return res.json({ error: "Anime not found or upload failed" });
}
