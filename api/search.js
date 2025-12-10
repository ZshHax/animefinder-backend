export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // удаляем data:image/...;base64,
    const cleanBase64 = image.replace(/^data:.*;base64,/, "");

    const response = await fetch("https://api.trace.moe/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: cleanBase64 }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: "trace.moe error", info: text });
    }

    const json = await response.json();
    return res.status(200).json(json);
  } catch (err) {
    console.error("Backend error:", err);
    return res.status(500).json({ error: "Server crash", message: err.message });
  }
}
