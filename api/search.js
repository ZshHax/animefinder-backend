export default async function handler(req, res) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // разрешаем все источники
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') {
    return res.status(204).set(headers).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).set(headers).json({ error: 'Only POST allowed' });
  }

  try {
    const { image } = req.body;
    if (!image) return res.status(400).set(headers).json({ error: 'No image provided' });

    const cleanBase64 = typeof image === 'string' ? image.replace(/^data:.*;base64,/, '') : '';

    const apiResp = await fetch('https://api.trace.moe/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: cleanBase64 })
    });

    if (!apiResp.ok) {
      const text = await apiResp.text();
      return res.status(502).set(headers).json({ error: 'trace.moe error', status: apiResp.status, info: text });
    }

    const json = await apiResp.json();
    return res.status(200).set(headers).json(json);

  } catch (err) {
    console.error('Backend crash:', err);
    return res.status(500).set(headers).json({ error: 'Server error', message: String(err) });
  }
}
