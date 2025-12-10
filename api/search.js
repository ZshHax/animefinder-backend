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

  try {
    let { image } = req.body;

    // Проверка
    if (!image || typeof image !== "string") {
      return res.status(400).json({ error: "Missing image" });
    }

    // === ГЛАВНОЕ ИСПРАВЛЕНИЕ ===
    // Если фронт прислал чистый base64 — добавим префикс.
    if (!image.startsWith("data:image")) {
      image = "data:image/jpeg;base64," + image;
    }

    const response = await fetch("https://api.trace.moe/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || "Trace.moe error" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
