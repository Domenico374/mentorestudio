async function transcribeAudio(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('language', 'it');
    
    console.log('Invio audio per trascrizione:', {
        size: audioBlob.size,
        type: audioBlob.type
    });
    
    const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
    });
    
    console.log('Risposta API:', {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type')
    });
    
    if (!response.ok) {
        // Prova a leggere come JSON, altrimenti come testo
        let errorMessage = `Errore server: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
            // Se non è JSON, leggi come testo
            const errorText = await response.text();
            console.error('Errore non-JSON:', errorText.substring(0, 500));
            errorMessage = `Errore server: ${response.status}. Controlla i log di Vercel.`;
        }
        throw new Error(errorMessage);
    }
    
    // Verifica che la risposta sia JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Risposta non-JSON:', textResponse.substring(0, 500));
        throw new Error('L\'API ha ritornato una risposta non valida. Verifica che l\'API /api/transcribe sia configurata correttamente.');
    }
    
    return await response.json();
}
