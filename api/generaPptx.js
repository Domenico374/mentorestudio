import pptxgen from "pptxgenjs";

export default async function handler(req, res) {
  try {
    const body = await getBody(req);
    const { titolo, contenuti } = JSON.parse(body);

    const pptx = new pptxgen();
    pptx.addSlide({ title: titolo });

    contenuti.forEach((slide) => {
      const s = pptx.addSlide();
      s.addText(slide.titolo, { x: 1, y: 0.5, fontSize: 24, bold: true });
      s.addText(slide.testo, { x: 1, y: 1.5, fontSize: 18 });
    });

    const arrayBuffer = await pptx.write("arraybuffer");
    const buffer = Buffer.from(arrayBuffer);

    res.writeHead(200, {
      "Content-Disposition": "attachment; filename=presentazione.pptx",
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });
    res.end(buffer);
  } catch (error) {
    console.error("Errore PPTX:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: error.message }));
  }
}

// Funzione helper per leggere il corpo della richiesta
function getBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
  });
}
