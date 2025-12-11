import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import cors from "cors";

const app = express();
const upload = multer();

// -------------------
// CONFIG
// -------------------
const PORT = process.env.PORT || 3000;
const CATBOX_USERHASH = "anonymous";
const IMGBB_KEY = "eb6002b5f8d3e3f209833e690ea0684d";

// -------------------
// CORS (ВАЖНО!)
// -------------------
app.use(cors({
  origin: "*"
}));

// -------------------
// 1) trace.moe direct upload
// -------------------
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

// -------------------
// 2) catbox upload
// -------------------
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

// -------------------
// 3) imgbb upload
// -------------------
async function tryImgbb(buffer) {
  try {
    const form = new FormData();
    form.append("image", buffer.toString("base64"));

    const resp = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
      {
        method: "POST",
        body: form
      }
    );

    const json = await resp.json();
    return json.success ? json.data.url : null;
  } catch {
    return null;
  }
}

// -------------------
// 4) trace.moe search by URL
// -------------------
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

// -------------------
// MAIN ROUTE
// -------------------
app.post("/api/search", upload.single("image"), async (req, res) => {
  if (!req.file) return res.json({ error: "No file" });

  const buffer = req.file.buffer;

  // Direct trace.moe upload
  let data = await tryTraceMoeFile(buffer);
  if (data?.result?.length) return res.json(data);

  // Catbox upload
  let url = await tryCatbox(buffer);
  if (url) {
    data = await traceMoeByUrl(url);
    if (data?.result?.length) return res.json(data);
  }

  // ImgBB upload
  url = await tryImgbb(buffer);
  if (url) {
    data = await traceMoeByUrl(url);
    if (data?.result?.length) return res.json(data);
  }

  return res.json({ error: "Anime not found or upload failed" });
});

// -------------------
// RUN SERVER
// -------------------
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
