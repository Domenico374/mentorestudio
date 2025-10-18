import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Funzione principale per generare contenuti
async function generateContent(text) {
    // ISTRUZIONI: rese più pulite per il JSON
    const system_prompt = `Sei un esperto creatore di materiali didattici. Analizza il testo fornito e restituisci ESCLUSIVAMENTE un oggetto JSON con la seguente struttura:
        
{
  "summary_short": "Un riassunto di 2-3 righe",
  "summary_long": "Un riassunto dettagliato di 5-7 righe",
  "highlights": ["punto 1", "punto 2", "punto 3", "punto 4", "punto 5"],
  "glossary": [
    {"term": "termine", "definition": "definizione"},
    // ... (8-10 termini in totale)
  ],
  "mind_map": ["concetto 1", "concetto 2", "concetto 3", "concetto 4", "concetto 5", "concetto 6", "concetto 7", "concetto 8"],
  "timeline": [
    {"date": "data", "event": "evento"}
    // ... (solo se sono presenti date)
  ],
  "flashcards": [
    {"q": "Domanda specifica sul testo?", "a": "Risposta breve e diretta"},
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

    try {
        const response = await openai.chat.completions.create({
            // *** CAMBIO MODELLO A GPT-4O-MINI e ABILITAZIONE JSON ***
            model: "gpt-4o-mini", // Molto più affidabile per output JSON
            response_format: { type: "json_object" }, // Forza l'output JSON
            // -----------------------------------------------------
            messages: [
                { role: "system", content: system_prompt }, // Usiamo il prompt come system
                { role: "user", content: `Analizza il testo qui sotto:\n\n${text}` } // L'utente fornisce il testo
            ],
            temperature: 0.7,
            max_tokens: 3000
        });

        // Ora la risposta è garantita essere un oggetto JSON valido
        const jsonString = response.choices[0].message.content;

        // Non usiamo più il regex, parsiamo direttamente (ora è sicuro)
        return JSON.parse(jsonString);

    } catch (error) {
        console.error('Errore OpenAI:', error);
        // Rilancia l'errore per il blocco superiore
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
        // Migliore gestione dell'errore per il frontend
        console.error('Errore nella generazione (FATAL):', error);
        res.status(500).json({ 
            error: 'Errore server 500: La generazione AI è fallita o ha restituito un formato non valido.',
            message: error.message 
        });
    }
}
