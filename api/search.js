export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb"
    }
  }
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: "Missing image" });
  }

  // Приводим к dataURL если нужно
  let dataUrl = image;
  if (!dataUrl.startsWith("data:image")) {
    dataUrl = "data:image/jpeg;base64," + dataUrl;
  }

  try {
    const resp = await fetch("https://api.trace.moe/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json" // ТАК НАДО для trace.moe
      },
      body: JSON.stringify({ image: dataUrl })
    });

    const data = await resp.json();

    if (!resp.ok) {
      return res
        .status(resp.status)
        .json({ error: data.error || "Trace.moe error" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("TRACE ERROR:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
