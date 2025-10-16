import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateContent(text) {
  const prompt = `Analizza questo testo e genera un JSON con la seguente struttura ESATTAMENTE:
{
  "summary_short": "Un riassunto di 2-3 righe",
  "summary_long": "Un riassunto dettagliato di 5-7 righe",
  "highlights": ["punto 1", "punto 2", "punto 3", "punto 4", "punto 5"],
  "glossary": [
    {"term": "termine", "definition": "definizione"}
  ],
  "timeline": [
    {"date": "1948", "event": "evento importante"}
  ],
  "mind_map": ["concetto 1", "concetto 2", "concetto 3", "concetto 4"],
  "flashcards": [
    {"q": "Domanda 1?", "a": "Risposta 1"}
  ],
  "quiz": [
    {"q": "Domanda quiz?", "options": ["A", "B", "C", "D"], "correct": 0}
  ]
}

Testo da analizzare:
${text}

IMPORTANTE:
- Rispondi SOLO con JSON valido
- highlights: array di 5 punti chiave
- glossary: 5-8 termini importanti con definizioni
- timeline: eventi significativi con date (se disponibili)
- mind_map: 4 concetti chiave
- flashcards: 8-10 domande/risposte per lo studio
- quiz: 5-8 domande a scelta multipla con risposta corretta (indice 0-3)
- Usa italiano per tutto il contenuto`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content;
  
  // Estrai JSON dalla risposta
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Impossibile estrarre JSON dalla risposta');
  }

  return JSON.parse(jsonMatch[0]);
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

    // Limita il testo a ~5000 caratteri per non superare i token
    const limitedText = text.substring(0, 5000);

    const data = await generateContent(limitedText);

    res.status(200).json(data);
  } catch (error) {
    console.error('Errore:', error);
    res.status(500).json({ 
      error: error.message || 'Errore nella generazione contenuti' 
    });
  }
}
