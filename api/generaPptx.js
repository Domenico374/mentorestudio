import pptxgen from "pptxgenjs";

export default async function handler(req, res) {
  // Verifica il metodo HTTP
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Metodo non consentito" }));
  }

  try {
    const body = await getBody(req);
    const { titolo, contenuti } = JSON.parse(body);

    // Validazione input
    if (!titolo || !Array.isArray(contenuti)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Dati non validi" }));
    }

    const pptx = new pptxgen();

    // Slide iniziale - CORRETTO
    const slideIniziale = pptx.addSlide();
    slideIniziale.addText(titolo, {
      x: 0.5,
      y: "40%",
      w: "90%",
      fontSize: 44,
      bold: true,
      align: "center",
      color: "363636"
    });

    // Slide di contenuto
    contenuti.forEach((slide) => {
      const s = pptx.addSlide();
      s.addText(slide.titolo, {
        x: 0.5,
        y: 0.5,
        w: "90%",
        fontSize: 28,
        bold: true,
        color: "363636"
      });
      s.addText(slide.testo, {
        x: 0.5,
        y: 1.5,
        w: "90%",
        fontSize: 18,
        color: "666666",
        valign: "top"
      });
    });

    const arrayBuffer = await pptx.write("arraybuffer");
    const buffer = Buffer.from(arrayBuffer);

    res.writeHead(200, {
      "Content-Disposition": "attachment; filename=presentazione.pptx",
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Length": buffer.length
    });
    res.end(buffer);

  } catch (error) {
    console.error("Errore PPTX:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: error.message }));
  }
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => resolve(body));
    req.on("error", (err) => reject(err));
  });
}
