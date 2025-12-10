import express from "express";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import cors from "cors";

const app = express();
app.use(cors());
const upload = multer();

app.post("/api/search", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const formData = new FormData();
        formData.append("file", req.file.buffer, {
            filename: "upload.jpg",
            contentType: "image/jpeg",
        });

        const response = await axios.post(
            "https://api.trace.moe/search?anilistInfo",
            formData,
            { headers: formData.getHeaders() }
        );

        res.json(response.data);
    } catch (error) {
        console.error("Trace.moe ERROR:", error.response?.data || error);
        res.status(500).json({ error: "Trace.moe request failed" });
    }
});

app.get("/", (req, res) => {
    res.send("AnimeFinder backend is running");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Backend running on PORT", PORT));
