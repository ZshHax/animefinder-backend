export default async function handler(req, res) {
    // ----- FIX CORS -----
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Preflight check (OPTIONS)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    // ---------------------

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const SAUCE_API_KEY = "cbd937f4ee0fb43d631f7d2bf758e895eb2c5809";

    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ error: "Image is required" });
        }

        const params = new URLSearchParams({
            api_key: SAUCE_API_KEY,
            output_type: "2",
            db: "999",
            numres: "5",
            url: image
        });

        const response = await fetch(
            "https://saucenao.com/search.php",
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params
            }
        );

        const data = await response.json();
        return res.status(200).json(data);

    } catch (err) {
        console.error("Backend error:", err);
        return res.status(500).json({ error: "Server error" });
    }
}
