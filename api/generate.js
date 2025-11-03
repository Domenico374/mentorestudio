// /api/generate.js (Next.js / Node ESM)

import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =========================
// Prompt di sistema
// =========================
const SYSTEM_PROMPT = `Sei un esperto creatore di materiali didattici. Analizza il testo fornito e restituisci ESCLUSIVAMENTE un oggetto JSON con la seguente struttura:
{
  "summary_short": "Un riassunto di 2-3 righe",
  "summary_long": "Un riassunto dettagliato di 5-7 righe",
  "highlights": ["punto 1", "punto 2", "punto 3", "punto 4", "punto 5"],
  "glossary": [
    {"term": "termine", "definition": "definizione"}
    // ... (8-10 termini in totale)
  ],
  "mind_map": ["concetto 1", "concetto 2", "concetto 3", "concetto 4", "concetto 5", "concetto 6", "concetto 7", "concetto 8"],
  "timeline": [
    {"date": "data", "event": "evento"}
    // ... (solo se sono presenti date)
  ],
  "flashcards": [
    {"q": "Domanda specifica sul testo?", "a": "Risposta breve e diretta"}
    // ... (20-25 carte)
  ],
  "quiz": [
    {"q": "Domanda a scelta multipla?", "options": ["Opzione A", "Opzione B", "Opzione C", "Opzione D"], "correct": 0}
    // ... (15-20 domande)
  ]
}
REQUISITI AGGIUNTIVI:
- Siglets: ESATTAMENTE 5 punti salienti.
- Glossario: 8-10 termini essenziali.
- Mind_map: 8 concetti chiave interconnessi.
- Flashcards: 20-25 domande/risposte.
- Quiz: 15-20 domande.
- Le domande devono coprire definizioni, applicazioni e analisi.
- La risposta DEVE essere un JSON ben formato.
`;

// =========================
// Funzione principale
// =========================
async function generateContent(text) {
  // Taglio hard limit sul testo (circa 8k char)
  const limitedText = text.slice(0, 8000).trim();

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `Analizza il testo qui sotto:\n\n${limitedText}` },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' }, // forza JSON valido
    messages,
    temperature: 0.2, // più deterministico per output strutturati
    max_tokens: 3000,
  });

  const content = response?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error('Risposta vuota o non valida dal modello.');
  }

  // Il model è già in JSON Mode, ma parsiamo comunque
  try {
    return JSON.parse(content);
  } catch (err) {
    // Se qualcosa va storto, ritentiamo una correzione minima
    // (di solito non serve, ma aiuta in casi limite)
    const fixed = content
      .trim()
      .replace(/^[^{]+/, '')
      .replace(/[^}]+$/, '');
    return JSON.parse(fixed);
  }
}

// =========================
// Handler HTTP (Next.js / Node)
// =========================
export default async function handler(req, res) {
  // CORS base
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  // Verifica API Key
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY non configurata' });
  }

  try {
    const { text } = req.body ?? {};

    if (typeof text !== 'string' || text.trim().length < 10) {
      return res.status(400).json({ error: 'Testo PDF vuoto o troppo corto (min 10 caratteri).' });
    }

    const data = await generateContent(text);

    // Piccola validazione sommaria dei campi principali
    if (
      !data ||
      typeof data !== 'object' ||
      !Array.isArray(data.highlights) ||
      data.highlights.length !== 5 ||
      !Array.isArray(data.mind_map) ||
      data.mind_map.length !== 8 ||
      !Array.isArray(data.flashcards) ||
      data.flashcards.length < 20 ||
      !Array.isArray(data.quiz) ||
      data.quiz.length < 15
    ) {
      // Non blocchiamo la risposta, ma segnaliamo al client
      return res.status(200).json({
        ...data,
        _warning:
          'Output generato ma non rispetta pienamente i vincoli richiesti (controlla highlights/mind_map/flashcards/quiz).',
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Errore nella generazione (FATAL):', error);

    // Risposte d’errore più chiare per il frontend
    const msg = (error && error.message) ? error.message : 'Errore sconosciuto.';
    return res.status(500).json({
      error: 'Errore server 500: La generazione AI è fallita o ha restituito un formato non valido.',
      message: msg,
    });
  }
}
