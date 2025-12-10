export const config = {
  api: {
    bodyParser: false,
  },
};

import Busboy from "busboy";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const busboy = Busboy({ headers: req.headers });
  let fileBuffer = Buffer.alloc(0);

  busboy.on("file", (name, file, info) => {
    file.on("data", (data) => {
      fileBuffer = Buffer.concat([fileBuffer, data]);
    });
  });

  busboy.on("finish", async () => {
    if (fileBuffer.length === 0) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const traceRes = await fetch("https://api.trace.moe/search", {
        method: "POST",
        headers: {
          "Content-Type": "image/jpeg",
        },
        body: fileBuffer,
      });

      const json = await traceRes.json();
      return res.status(200).json(json);
    } catch (err) {
      return res.status(500).json({ error: "Trace.moe error", details: err });
    }
  });

  req.pipe(busboy);
}
