export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  //
  // 1) CORS FIX
  //
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
    //
    // 2) Получаем изображение
    //
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    //
    // 3) Отправляем в trace.moe
    //
    const trace = await fetch(`https://api.trace.moe/search?anilistInfo`, {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg", // ок, trace.moe сам определит
      },
      body: buffer,
    });

    const result = await trace.json();

    //
    // 4) Ответ
    //
    return res.status(200).json(result);

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
