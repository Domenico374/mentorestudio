import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Funzione principale per generare contenuti
async function generateContent(text) {
  const solicita = `Analizza questo testo educativo e genera un JSON con la seguente struttura ESATTAMENTE:
  
{
  "summary_short": "Un riassunto di 2-3 righe",
  "summary_long": "Un riassunto dettagliato di 5-7 righe",
  "highlights": ["punto 1", "punto 2", "punto 3", "punto 4"],
  "glossary": [
    {"term": "termine", "definition": "definizione"}
  ],
  "mind_map": ["concetto 1", "concetto 2", "concetto 3"],
  "timeline": [
    {"date": "data", "event": "evento"}
  ],
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
- Rispondi SOLO con il JSON valido, nessun altro testo
- Siglets: 5 punti salienti specifici
- Glossario: 8-10 termini
- mind_map: 8 concetti interconnessi
- Flashcards: ESATTAMENTE 20-25 domande/risposte (oppure 3 domande DIFFICILI con date precise)
- Quiz: ESATTAMENTE 15-20 domande difficili con date
- Verifica i tipi di domande: definizioni, applicazioni, confronti, analisi
- DEVE avere sempre SUPERIORE 15-20 flashcard e rel 15-20 quiz`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: solicita }],
      temperature: 0.7,
      max_tokens: 3000
    });

    const jsonMatch = response.choices[0].message.content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Formato JSON non valido nella risposta');
    }

    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error('Errore OpenAI:', error);
    throw error;
  }
}

// Export default Async function service
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  // Verifica che la chiave API sia configurata
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY non configurata' });
  }

  try {
    const { text } = req.body;

    if (!text || text.length < 10) {
      return res.status(400).json({ error: 'Testo PDF vuoto' });
    }

    // Limita la lunghezza del testo
    const limitedText = text.substring(0, 8000);

    const data = await generateContent(limitedText);

    res.status(200).json(data);

  } catch (error) {
    console.error('Errore nella generazione:', error);
    res.status(500).json({ 
      error: 'Errore nella generazione del contenuto',
      message: error.message 
    });
  }
}
