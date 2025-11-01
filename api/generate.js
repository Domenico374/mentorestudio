import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Funzione principale per generare contenuti
async function generateContent(text) {
    const system_prompt = `Sei un esperto creatore di materiali didattici. Analizza il testo fornito e restituisci ESCLUSIVAMENTE un oggetto JSON con la seguente struttura:
        
{
  "summary_short": "Un riassunto di 2-3 righe",
  "summary_long": "Un riassunto dettagliato di 5-7 righe",
  "highlights": ["punto 1", "punto 2", "punto 3", "punto 4", "punto 5"],
  "glossary": [
    {"term": "termine", "definition": "definizione"}
  ],
  "mind_map": ["concetto 1", "concetto 2", "concetto 3", "concetto 4", "concetto 5", "concetto 6", "concetto 7", "concetto 8"],
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

REQUISITI:
- mind_map: 8 concetti chiave interconnessi.
- La risposta DEVE essere un JSON ben formato.
`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: system_prompt },
                { role: "user", content: `Analizza il testo qui sotto:\n\n${text}` }
            ],
            temperature: 0.7,
            max_tokens: 3000
        });

        const jsonString = response.choices[0].message.content;
        const data = JSON.parse(jsonString);

        // 🔧 Trasforma l'array mind_map in codice Mermaid
        if (Array.isArray(data.mind_map)) {
            const title = "Mappa Mentale";
            const branches = data.mind_map.map(item => `  ${item}`).join('\n');
            data.mindmapDetailed = `mindmap\n  root((${title}))\n${branches}`;
        }

        return data;

    } catch (error) {
        console.error('Errore OpenAI:', error);
        throw error;
    }
}

// Export default Async function service
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metodo non consentito' });
    }

    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OPENAI_API_KEY non configurata' });
    }

    try {
        const { text } = req.body;

        if (!text || text.length < 10) {
            return res.status(400).json({ error: 'Testo PDF vuoto' });
        }

        const limitedText = text.substring(0, 8000);
        const data = await generateContent(limitedText);

        res.status(200).json(data);

    } catch (error) {
        console.error('Errore nella generazione (FATAL):', error);
        res.status(500).json({ 
            error: 'Errore server 500: La generazione AI è fallita o ha restituito un formato non valido.',
            message: error.message 
        });
    }
}
