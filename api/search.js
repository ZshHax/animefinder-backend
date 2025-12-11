// Установите node-fetch, если еще не сделали: npm install cross-fetch
const fetch = require('cross-fetch');

module.exports = async (req, res) => {
  // Устанавливаем заголовки CORS, чтобы ваш фронтенд на GitHub Pages мог получить ответ
  res.setHeader('Access-Control-Allow-Origin', 'https://zshhax.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Обработка предварительных OPTIONS-запросов от браузера (CORS handshake)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { imageUrl } = req.body;

  if (!imageUrl) {
    res.status(400).send('Missing imageUrl in request body');
    return;
  }

  try {
    // Делаем запрос к trace.moe API с бэкенда (сервер-сервер, без проблем с CORS)
    const response = await fetch(`api.trace.moe{encodeURIComponent(imageUrl)}`);
    
    if (!response.ok) {
      throw new Error(`trace.moe API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Error fetching from trace.moe:', error);
    res.status(500).json({ error: 'Failed to fetch anime data', details: error.message });
  }
};
