import pptxgen from "pptxgenjs";

export default async function handler(req, res) {
  try {
    const { titolo, contenuti } = req.body;

    const pptx = new pptxgen();
    pptx.addSlide({ title: titolo });

    contenuti.forEach((slide) => {
      const slideObj = pptx.addSlide();
      slideObj.addText(slide.titolo, { x: 1, y: 0.5, fontSize: 24, bold: true });
      slideObj.addText(slide.testo, { x: 1, y: 1.5, fontSize: 18 });
    });

    const arrayBuffer = await pptx.write("arraybuffer");
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Disposition", "attachment; filename=presentazione.pptx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    res.send(buffer);

  } catch (error) {
    console.error("Errore PPTX:", error);
    res.status(500).json({ error: error.message });
  }
}
