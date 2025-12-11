// api/search.js

// ВАЖНО: Отключаем автоматический парсинг тела запроса Vercel'ем.
// Это нужно, чтобы передать файл "как есть" (потоком).
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // 1. Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); // Или 'https://zshhax.github.io'
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Обработка preflight запроса
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 2. Перенаправление запроса на Trace.moe
    // Мы берем весь запрос от фронта (req) и пересылаем его в trace.moe
    // Trace.moe ожидает POST с бинарными данными картинки.
    
    const traceResponse = await fetch("https://api.trace.moe/search?anilistInfo", {
      method: "POST",
      body: req, // Передаем входящий поток данных прямо в исходящий запрос
      headers: {
        "Content-Type": req.headers["content-type"], // Сохраняем тип контента (image/jpeg и т.д.)
      },
    });

    const data = await traceResponse.json();

    // Если Trace.moe вернул ошибку
    if (!traceResponse.ok) {
        console.error("Trace.moe error:", data);
        return res.status(traceResponse.status).json(data);
    }

    // 3. Возврат успешного ответа на фронт
    return res.status(200).json(data);

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
