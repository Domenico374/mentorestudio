// /api/extract.js
// Estrae testo da DOCX/PDF/PPTX/TXT/HTML/EPUB usando textract.
// Le immagini NON qui (le facciamo client-side con Tesseract per OCR).

import textract from "textract";

export default async function handler(req, res) {
  // CORS come negli altri endpoint
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  try {
    const { name, mime, data } = req.body || {};
    if (!data || !name) return res.status(400).json({ error: "Manca file/base64" });

    const buffer = Buffer.from(data, "base64");
    const ext = (name.split(".").pop() || "").toLowerCase();

    // NB: immagini/audio/video non qui
    if ((mime || "").startsWith("image/")) {
      return res.status(400).json({ error: "OCR immagini lato client (Tesseract)" });
    }

    const guessed = guessMime(ext);
    const contentType = mime || guessed;

    const text = await new Promise((resolve, reject) => {
      textract.fromBufferWithMime(contentType, buffer, (err, t) => {
        if (err) return reject(err);
        resolve(String(t || "").trim());
      });
    });

    return res.json({ text, meta: { type: "file", name, mime: contentType } });
  } catch (e) {
    console.error("extract error:", e);
    res.status(500).json({ error: e.message });
  }
}

function guessMime(ext) {
  const m = {
    pdf:  "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt:  "text/plain",
    md:   "text/markdown",
    html: "text/html",
    htm:  "text/html",
    epub: "application/epub+zip",
  };
  return m[ext] || "application/octet-stream";
}
