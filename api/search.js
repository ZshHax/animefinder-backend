export const config = {
  runtime: "edge"
};

export default async function handler(req) {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Only POST allowed" }), {
        status: 405,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        }
      });
    }

    const body = await req.json();
    const base64 = body.image;

    if (!base64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
        }
      });
    }

    // Конвертируем base64 → файл
    const imgBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    // ⚠️ ВСТАВЬ СВОЙ API KEY
    const API_KEY = "cbd937f4ee0fb43d631f7d2bf758e895eb2c5809";

    const formData = new FormData();
    formData.append("output_type", "2");
    formData.append("api_key", API_KEY);
    formData.append("file", new Blob([imgBuffer]), "upload.jpg");

    const sauce = await fetch("https://saucenao.com/search.php", {
      method: "POST",
      body: formData
    });

    const result = await sauce.json();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
      }
    });
  }
}
