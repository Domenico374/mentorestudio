import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateContent(text) {
  const prompt = `Analizza questo testo educativo e genera un JSON con la seguente struttura ESATTAMENTE:
{
  "summary_short": "Un riassunto di 2-3 righe",
  "summary_long": "Un riassunto dettagliato di 5-7 righe",
  "highlights": ["punto 1", "punto 2", "punto 3", "punto 4", "punto 5"],
  "glossary": [
    {"term": "termine", "definition": "definizione"}
  ],
  "timeline": [
    {"date": "1948", "event": "evento"}
  ],
  "mind_map": ["concetto 1", "concetto 2", "concetto 3", "concetto 4"],
  "flashcards": [
    {"q": "Domanda?", "a": "Risposta"}
  ],
  "quiz": [
    {"q": "Domanda?", "options": ["A", "B", "C", "D"], "correct": 0}
  ]
}

Testo:
${text}

IMPORTANTE:
- Rispondi SOLO con JSON valido
- highlights: 5 punti chiave specifici
- glossary: 8-10 termini
- timeline: eventi significativi con date
- mind_map: 4 concetti interconnessi
- flashcards: 20-25 domande/risposte (MOLTE per studio intensivo)
- quiz: 15-20 domande DIFFICILI e SPECIFICHE (test comprensione profonda)
- Varia i tipi di domande: definizioni, applicazioni, confronti, analisi
- Usa italiano per tutto il contenuto`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('OpenAI non ha restituito JSON valido');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Errore OpenAI:', error.message);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Testo PDF vuoto' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY non configurata' });
    }

    const limitedText = text.substring(0, 8000);
    const data = await generateContent(limitedText);

    res.status(200).json(data);
  } catch (error) {
    console.error('Errore completo:', error);
    res.status(500).json({ 
      error: error.message || 'Errore nella generazione contenuti'
    });
  }
}
