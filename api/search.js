import fetch from "node-fetch";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // чтобы большие картинки проходили
    },
  },
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    // ⚠️ ВСТАВЬ СВОЙ API KEY НИЖЕ
    const SAUCE_API_KEY = "cbd937f4ee0fb43d631f7d2bf758e895eb2c5809";

    // Конвертируем base64 → бинарный буфер
    const binaryImage = Buffer.from(image, "base64");

    // Создаем form-data
    const form = new FormData();
    form.append("output_type", "2");
    form.append("api_key", SAUCE_API_KEY);
    form.append("file", binaryImage, {
      filename: "image.jpg",
      contentType: "image/jpeg",
    });

    // Отправляем запрос к SauceNAO
    const response = await fetch("https://saucenao.com/search.php", {
      method: "POST",
      body: form,
    });

    const json = await response.json();

    return res.status(200).json(json);

  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
