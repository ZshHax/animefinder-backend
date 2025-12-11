export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    console.log("Image received, length:", image.length);

    // ВАЖНО: trace.moe требует ПОЛНЫЙ dataURL!
    let dataUrl = image;
    if (!image.startsWith("data:")) {
      dataUrl = "data:image/jpeg;base64," + image;
    }

    const response = await fetch("https://api.trace.moe/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dataUrl })
    });

    const json = await response.json();

    if (!response.ok) {
      console.error("trace.moe error:", json);
      return res.status(500).json({ error: "trace.moe error", details: json });
    }

    return res.status(200).json(json);

  } catch (err) {
    console.error("Server crash:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
