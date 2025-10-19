// API endpoint per trascrizione audio con Whisper di OpenAI
// Posizionare in: /api/transcribe.js (per Vercel/Next.js)

export const config = {
  api: {
    bodyParser: false, // Necessario per gestire multipart/form-data
  },
};

export default async function handler(req, res) {
  // Accetta solo richieste POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Metodo non consentito',
      message: 'Utilizzare POST per questo endpoint' 
    });
  }

  try {
    // Verifica presenza chiave API
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY non configurata');
      return res.status(500).json({ 
        error: 'Configurazione mancante',
        message: 'Il servizio non è configurato correttamente' 
      });
    }

    // Parse multipart/form-data
    const formData = await parseMultipartForm(req);
    
    if (!formData.audio) {
      return res.status(400).json({ 
        error: 'File audio mancante',
        message: 'Nessun file audio caricato' 
      });
    }

    const audioFile = formData.audio;
    const language = formData.language || 'it'; // Default italiano

    // Validazione file
    const validationError = validateAudioFile(audioFile);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    console.log('Trascrizione richiesta:', {
      filename: audioFile.filename,
      size: audioFile.size,
      type: audioFile.mimetype,
      language: language
    });

    // Chiama Whisper API
    const transcription = await transcribeWithWhisper(
      audioFile,
      language,
      process.env.OPENAI_API_KEY
    );

    // Log per monitoraggio
    console.log('Trascrizione completata:', {
      textLength: transcription.text.length,
      duration: transcription.duration
    });

    // Ritorna la trascrizione
    return res.status(200).json({
      text: transcription.text,
      duration: transcription.duration,
      language: transcription.language,
      segments: transcription.segments || null
    });

  } catch (error) {
    console.error('Errore nella trascrizione:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Gestisci errori specifici di OpenAI
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      if (status === 401) {
        return res.status(500).json({ 
          error: 'Autenticazione fallita',
          message: 'Problema con la chiave API OpenAI' 
        });
      }

      if (status === 413) {
        return res.status(413).json({ 
          error: 'File troppo grande',
          message: 'Il file audio supera il limite di 25MB di Whisper' 
        });
      }

      if (status === 429) {
        return res.status(429).json({ 
          error: 'Limite richieste superato',
          message: 'Troppi tentativi. Riprova tra qualche minuto' 
        });
      }

      return res.status(status).json({ 
        error: 'Errore API OpenAI',
        message: errorData.error?.message || 'Errore sconosciuto' 
      });
    }

    // Gestisci errori di rete
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        error: 'Servizio non disponibile',
        message: 'Impossibile raggiungere OpenAI. Riprova più tardi' 
      });
    }

    // Errore generico
    return res.status(500).json({
      error: 'Errore interno del server',
      message: 'Si è verificato un errore durante la trascrizione'
    });
  }
}

// Funzione per parsare multipart/form-data
async function parseMultipartForm(req) {
  return new Promise((resolve, reject) => {
    const busboy = require('busboy');
    const bb = busboy({ headers: req.headers });
    
    const fields = {};
    const files = {};
    
    bb.on('field', (name, val) => {
      fields[name] = val;
    });
    
    bb.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      const chunks = [];
      
      file.on('data', (data) => {
        chunks.push(data);
      });
      
      file.on('end', () => {
        files[name] = {
          filename: filename,
          mimetype: mimeType,
          encoding: encoding,
          size: Buffer.concat(chunks).length,
          buffer: Buffer.concat(chunks)
        };
      });
    });
    
    bb.on('finish', () => {
      resolve({ ...fields, ...files });
    });
    
    bb.on('error', (error) => {
      reject(error);
    });
    
    req.pipe(bb);
  });
}

// Validazione file audio
function validateAudioFile(file) {
  // Tipi MIME consentiti
  const allowedTypes = [
    'audio/mpeg',      // MP3
    'audio/mp3',
    'audio/wav',       // WAV
    'audio/wave',
    'audio/x-wav',
    'audio/mp4',       // M4A
    'audio/x-m4a',
    'audio/webm',      // WebM
    'audio/ogg',       // OGG
    'video/webm',      // WebM video container
    'video/mp4'        // MP4
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return {
      error: 'Formato file non supportato',
      message: `Formato ${file.mimetype} non valido. Usa MP3, WAV, M4A, WebM, OGG`
    };
  }

  // Limite dimensione: 25MB (limite Whisper)
  const MAX_SIZE = 25 * 1024 * 1024; // 25MB in bytes
  if (file.size > MAX_SIZE) {
    return {
      error: 'File troppo grande',
      message: `Il file supera il limite di 25MB (dimensione: ${(file.size / 1024 / 1024).toFixed(2)}MB)`
    };
  }

  // Dimensione minima ragionevole: 1KB
  if (file.size < 1024) {
    return {
      error: 'File troppo piccolo',
      message: 'Il file audio sembra corrotto o vuoto'
    };
  }

  return null; // Validazione OK
}

// Trascrizione con Whisper
async function transcribeWithWhisper(audioFile, language, apiKey) {
  const FormData = require('form-data');
  const axios = require('axios');
  
  // Crea FormData per Whisper
  const formData = new FormData();
  formData.append('file', audioFile.buffer, {
    filename: audioFile.filename,
    contentType: audioFile.mimetype
  });
  formData.append('model', 'whisper-1');
  formData.append('language', language);
  formData.append('response_format', 'verbose_json'); // Include timestamp
  formData.append('temperature', '0'); // Maggiore accuratezza

  // Chiama Whisper API
  const response = await axios.post(
    'https://api.openai.com/v1/audio/transcriptions',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...formData.getHeaders()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 120000 // 2 minuti timeout
    }
  );

  return {
    text: response.data.text,
    duration: response.data.duration || null,
    language: response.data.language || language,
    segments: response.data.segments || null
  };
}

// Export per testing (opzionale)
module.exports = { validateAudioFile, transcribeWithWhisper };
