export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST is allowed" });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Если пришел "голый base64", автоматически добавим префикс PNG
    let normalizedImage = image;
    if (!image.startsWith("data:image")) {
      normalizedImage = "data:image/jpeg;base64," + image;
    }

    const traceResp = await fetch("https://api.trace.moe/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: normalizedImage }),
    });

    const data = await traceResp.json();

    if (!traceResp.ok) {
      return res.status(traceResp.status).json({
        error: data.error || "trace.moe returned an error",
      });
    }

    return res.status(200).json({
      result: data.result || [],
    });

  } catch (e) {
    console.error("SERVER ERROR:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}
