import formidable from "formidable";
import fs from "fs";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const SAUCE_API_KEY = "cbd937f4ee0fb43d631f7d2bf758e895eb2c5809";

    const form = new formidable.IncomingForm();

    form.parse(req, async (error, fields, files) => {
        if (error) {
            return res.status(500).json({ error: "Form parsing error" });
        }

        const file = files.image;
        if (!file) {
            return res.status(400).json({ error: "Image file missing" });
        }

        try {
            const fileBuffer = fs.readFileSync(file.filepath);

            const response = await fetch(
                `https://saucenao.com/search.php?output_type=2&api_key=${SAUCE_API_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": file.mimetype,
                    },
                    body: fileBuffer,
                }
            );

            const data = await response.json();
            return res.status(200).json(data);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "SauceNAO request error" });
        }
    });
}
