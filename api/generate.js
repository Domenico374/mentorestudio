<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="MentoreStudio - Il tuo mentore personale per lo studio intelligente">
    <title>📚 MentoreStudio - Studia Intelligente</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
            --primary: #667eea;
            --secondary: #764ba2;
            --accent: #f093fb;
            --success: #4caf50;
            --danger: #f44336;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            min-height: 100vh;
            padding: 20px;
        }
        body.dark-mode { background: #0f0f1e; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            background: white;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        body.dark-mode .header { background: #2a2a3e; color: #e0e0e0; }
        h1 { font-size: 1.8em; color: var(--primary); }
        body.dark-mode h1 { color: var(--accent); }
        .header-controls { display: flex; gap: 10px; }
        .toggle-btn {
            padding: 10px 15px;
            border: none;
            border-radius: 8px;
            background: var(--primary);
            color: white;
            cursor: pointer;
            font-weight: bold;
        }
        .upload-section {
            background: white;
            border-radius: 15px;
            padding: 40px;
            text-align: center;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        body.dark-mode .upload-section { background: #2a2a3e; color: #e0e0e0; }
        input[type="file"] {
            padding: 12px;
            margin: 10px 0;
            border: 2px solid var(--primary);
            border-radius: 8px;
            width: 100%;
            max-width: 400px;
        }
        body.dark-mode input { background: #1a1a2e; color: #e0e0e0; border-color: var(--secondary); }
        .btn {
            padding: 12px 25px;
            border: none;
            border-radius: 8px;
            background: var(--primary);
            color: white;
            cursor: pointer;
            font-weight: bold;
            margin-top: 15px;
        }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
        .btn.danger { background: var(--danger); }
        .tabs {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 20px;
            background: white;
            padding: 15px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        body.dark-mode .tabs { background: #2a2a3e; }
        .tab-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            background: #f0f0f0;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
        }
        body.dark-mode .tab-btn { background: #1a1a2e; color: #e0e0e0; }
        .tab-btn.active { background: var(--primary); color: white; }
        .content-area {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            min-height: 500px;
        }
        body.dark-mode .content-area { background: #2a2a3e; color: #e0e0e0; }
        .hidden { display: none !important; }
        .section { margin-bottom: 30px; }
        .section h2 { color: var(--primary); margin-bottom: 15px; border-bottom: 2px solid var(--primary); padding-bottom: 10px; }
        body.dark-mode .section h2 { color: var(--accent); border-color: var(--accent); }
        .card { background: #f5f7ff; padding: 20px; border-radius: 10px; margin: 10px 0; border-left: 4px solid var(--primary); }
        body.dark-mode .card { background: #1a1a2e; border-left-color: var(--accent); }
        .study-item {
            background: #f5f7ff;
            padding: 15px;
            border-radius: 10px;
            margin: 10px 0;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        body.dark-mode .study-item { background: #1a1a2e; }
        .study-item:hover { transform: translateX(5px); background: #e8eaff; }
        .study-item.processing { opacity: 0.7; }
        .loading { text-align: center; padding: 40px; }
        .spinner { border: 4px solid #f0f0f0; border-top: 4px solid var(--primary); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .progress-bar { background: #e0e0e0; height: 10px; border-radius: 5px; margin: 15px 0; overflow: hidden; }
        .progress-fill { background: var(--primary); height: 100%; transition: width 0.3s; }
        .flashcard { perspective: 1000px; height: 300px; cursor: pointer; margin: 20px 0; }
        .flashcard-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; }
        .flashcard-inner.flipped { transform: rotateY(180deg); }
        .flashcard-front, .flashcard-back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; display: flex; align-items: center; justify-content: center; padding: 20px; text-align: center; border-radius: 10px; font-size: 1.2em; font-weight: bold; }
        .flashcard-front { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; }
        .flashcard-back { background: linear-gradient(135deg, var(--accent), #f5576c); color: white; transform: rotateY(180deg); }
        .controls { display: flex; gap: 10px; margin-top: 20px; justify-content: center; flex-wrap: wrap; }
        .quiz-option { background: #f5f7ff; padding: 15px; margin: 10px 0; border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: all 0.3s; }
        body.dark-mode .quiz-option { background: #1a1a2e; }
        .quiz-option:hover { background: #e8eaff; }
        .quiz-option.correct { border-color: var(--success); background: #c8e6c9; }
        .quiz-option.incorrect { border-color: var(--danger); background: #ffcdd2; }
        .study-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .study-info { font-size: 0.9em; color: #666; }
        body.dark-mode .study-info { color: #aaa; }
        .highlight-item { cursor: pointer; transition: all 0.3s; }
        .highlight-item:hover { transform: translateX(5px); background: #e8eaff !important; }
        .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); }
        .modal.show { display: flex; align-items: center; justify-content: center; }
        .modal-content { background: white; padding: 30px; border-radius: 15px; max-width: 500px; width: 90%; box-shadow: 0 10px 50px rgba(0,0,0,0.3); }
        body.dark-mode .modal-content { background: #2a2a3e; color: #e0e0e0; }
        .modal-close { float: right; font-size: 28px; font-weight: bold; cursor: pointer; color: #999; }
        .modal-close:hover { color: #000; }
        body.dark-mode .modal-close:hover { color: #fff; }
        .concept-tag { display: inline-block; background: var(--primary); color: white; padding: 8px 15px; border-radius: 20px; margin: 5px 5px 5px 0; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 MentoreStudio</h1>
            <div class="header-controls">
                <button class="toggle-btn" onclick="toggleDarkMode()">🌙</button>
            </div>
        </div>

        <div id="uploadSection" class="upload-section">
            <h2>🚀 Carica i tuoi PDF di lezioni</h2>
            <input type="file" id="pdfFiles" accept=".pdf" multiple>
            <button class="btn" onclick="loadMultiplePDFs()" style="width: 100%; max-width: 400px;">📂 Carica e Genera</button>
            <p style="font-size: 0.9em; margin-top: 10px; color: #666;">Puoi caricare fino a 10 PDF contemporaneamente</p>
        </div>

        <div id="mainApp" class="hidden">
            <div class="tabs">
                <button class="tab-btn active" onclick="switchTab('library', event)">📚 Libreria Studi</button>
                <button class="tab-btn" onclick="switchTab('summary', event)">📝 Riassunto</button>
                <button class="tab-btn" onclick="switchTab('highlights', event)">⭐ Punti Salienti</button>
                <button class="tab-btn" onclick="switchTab('glossary', event)">📖 Glossario</button>
                <button class="tab-btn" onclick="switchTab('timeline', event)">📅 Timeline</button>
                <button class="tab-btn" onclick="switchTab('mindmap', event)">🧠 Mappa Mentale</button>
                <button class="tab-btn" onclick="switchTab('flashcards', event)">🎴 Flashcard</button>
                <button class="tab-btn" onclick="switchTab('quiz', event)">❓ Quiz</button>
            </div>
            <div class="content-area" id="contentArea"></div>
        </div>

        <div id="conceptModal" class="modal" onclick="closeConceptModal(event)">
            <div class="modal-content" onclick="event.stopPropagation()">
                <span class="modal-close" onclick="closeConceptModal()">&times;</span>
                <h2 id="modalTitle" style="color: var(--primary); margin-bottom: 20px;"></h2>
                <div id="modalConcepts"></div>
            </div>
        </div>
    </div>

    <script>
        let appState = {
            studies: JSON.parse(localStorage.getItem('mentorestudio_studies')) || {},
            currentStudyId: null,
            currentFlashcard: 0,
            currentQuiz: 0,
            quizScore: 0,
            darkMode: localStorage.getItem('darkMode') === 'true'
        };

        if (appState.darkMode) document.body.classList.add('dark-mode');

        function toggleDarkMode() {
            appState.darkMode = !appState.darkMode;
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', appState.darkMode);
        }

        async function loadMultiplePDFs() {
            const files = document.getElementById('pdfFiles').files;
            if (files.length === 0) { alert('Seleziona almeno un PDF'); return; }

            showMainApp();
            let processedCount = 0;

            for (let file of files) {
                try {
                    const text = await extractPDFText(file);
                    const studyId = Date.now() + Math.random();
                    
                    updateProgress(processedCount, files.length, `Elaborando: ${file.name}`);
                    
                    const data = await generateContent(text);
                    
                    appState.studies[studyId] = {
                        id: studyId,
                        name: file.name.replace('.pdf', ''),
                        data: data,
                        date: new Date().toLocaleDateString('it-IT'),
                        pages: Math.ceil(text.length / 2000)
                    };
                    
                    processedCount++;
                    updateProgress(processedCount, files.length, `Completato: ${file.name}`);
                } catch (e) {
                    alert(`Errore con ${file.name}: ${e.message}`);
                }
            }

            saveStudies();
            renderLibrary();
            switchTab('library');
        }

        async function extractPDFText(file) {
            const reader = new FileReader();
            return new Promise((resolve) => {
                reader.onload = async (e) => {
                    const pdf = await pdfjsLib.getDocument(e.target.result).promise;
                    let text = '';
                    for (let i = 0; i < Math.min(pdf.numPages, 20); i++) {
                        const page = await pdf.getPage(i + 1);
                        const content = await page.getTextContent();
                        text += content.items.map(x => x.str).join(' ') + '\n';
                    }
                    resolve(text);
                };
                reader.readAsArrayBuffer(file);
            });
        }

        function updateProgress(current, total, message) {
            document.getElementById('contentArea').innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>${message}</p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(current/total)*100}%"></div>
                    </div>
                    <p>${current}/${total}</p>
                </div>
            `;
        }

        function showMainApp() {
            document.getElementById('uploadSection').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');
        }

        async function generateContent(text) {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text.substring(0, 8000) })
            });

            if (!response.ok) throw new Error('Errore server: ' + response.status);
            return await response.json();
        }

        function saveStudies() {
            localStorage.setItem('mentorestudio_studies', JSON.stringify(appState.studies));
        }

        function switchTab(tab, e) {
            if (e) {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            }
            switch(tab) {
                case 'library': renderLibrary(); break;
                case 'summary': renderSummary(); break;
                case 'highlights': renderHighlights(); break;
                case 'glossary': renderGlossary(); break;
                case 'timeline': renderTimeline(); break;
                case 'mindmap': renderMindMap(); break;
                case 'flashcards': renderFlashcards(); break;
                case 'quiz': renderQuiz(); break;
            }
        }

        function renderLibrary() {
            let html = '<h2>📚 Le tue lezioni</h2>';
            const studies = Object.values(appState.studies);
            
            if (studies.length === 0) {
                html += '<p style="text-align: center; color: #999;">Nessuna lezione caricata. Carica i tuoi PDF sopra.</p>';
            } else {
                studies.forEach(study => {
                    html += `
                        <div class="study-item" onclick="selectStudy('${study.id}')">
                            <div>
                                <strong>${study.name}</strong>
                                <div class="study-info">${study.date} • ${study.pages} pagine</div>
                            </div>
                            <button class="btn" onclick="deleteStudy('${study.id}', event)" style="margin: 0; background: var(--danger); padding: 8px 15px;">🗑️</button>
                        </div>
                    `;
                });
                html += '<button class="btn" onclick="resetApp()" style="width: 100%; margin-top: 20px;">➕ Carica altre lezioni</button>';
            }
            document.getElementById('contentArea').innerHTML = html;
        }

        function selectStudy(studyId) {
            appState.currentStudyId = studyId;
            appState.currentFlashcard = 0;
            appState.currentQuiz = 0;
            appState.quizScore = 0;
            switchTab('summary');
        }

        function deleteStudy(studyId, e) {
            e.stopPropagation();
            if (confirm('Eliminare questa lezione?')) {
                delete appState.studies[studyId];
                saveStudies();
                renderLibrary();
            }
        }

        function getCurrentStudy() {
            return appState.studies[appState.currentStudyId];
        }

        function renderSummary() {
            const study = getCurrentStudy();
            if (!study) return;
            document.getElementById('contentArea').innerHTML = `
                <div class="study-header">
                    <h2>${study.name}</h2>
                    <button class="btn" onclick="switchTab('library')" style="margin: 0;">← Indietro</button>
                </div>
                <div class="section"><h2>📝 Riassunto Breve</h2><div class="card">${study.data.summary_short || 'N/A'}</div></div>
                <div class="section"><h2>📖 Riassunto Completo</h2><div class="card">${study.data.summary_long || 'N/A'}</div></div>
            `;
        }

        function renderHighlights() {
            const study = getCurrentStudy();
            if (!study) return;
            let html = `<div class="study-header"><h2>${study.name}</h2><button class="btn" onclick="switchTab('library')" style="margin: 0;">← Indietro</button></div><h2>⭐ Punti Salienti</h2><p style="color: #666; font-size: 0.9em; margin-bottom: 15px;">Clicca su un punto per vedere i concetti chiave</p>`;
            
            (study.data.highlights || []).forEach((h, i) => {
                const title = typeof h === 'string' ? h : h.title;
                const concepts = typeof h === 'object' ? (h.concepts || []) : [];
                html += `<div class="card highlight-item" onclick="showConcepts('${title}', ${JSON.stringify(concepts).replace(/'/g, "\\'")})" style="cursor: pointer;"><strong>${i+1}. ${title}</strong>`;
                if (concepts.length > 0) {
                    html += `<div style="margin-top: 10px; font-size: 0.85em; color: #999;">📌 ${concepts.length} concetti disponibili</div>`;
                }
                html += `</div>`;
            });
            document.getElementById('contentArea').innerHTML = html;
        }

        function showConcepts(title, concepts) {
            document.getElementById('modalTitle').innerText = title;
            let conceptsHtml = '<p style="margin-bottom: 15px;">Concetti chiave correlati:</p>';
            concepts.forEach(concept => {
                conceptsHtml += `<div class="concept-tag">${concept}</div>`;
            });
            document.getElementById('modalConcepts').innerHTML = conceptsHtml;
            document.getElementById('conceptModal').classList.add('show');
        }

        function closeConceptModal(event) {
            if (event && event.target.id !== 'conceptModal') return;
            document.getElementById('conceptModal').classList.remove('show');
        }

        function renderGlossary() {
            const study = getCurrentStudy();
            if (!study) return;
            let html = `<div class="study-header"><h2>${study.name}</h2><button class="btn" onclick="switchTab('library')" style="margin: 0;">← Indietro</button></div><h2>📖 Glossario</h2>`;
            (study.data.glossary || []).forEach(item => { html += `<div class="card"><strong>${item.term}</strong><p>${item.definition}</p></div>`; });
            document.getElementById('contentArea').innerHTML = html;
        }

        function renderTimeline() {
            const study = getCurrentStudy();
            if (!study) return;
            let html = `<div class="study-header"><h2>${study.name}</h2><button class="btn" onclick="switchTab('library')" style="margin: 0;">← Indietro</button></div><h2>📅 Timeline</h2>`;
            (study.data.timeline || []).forEach(item => { html += `<div class="card"><strong>${item.date}</strong><p>${item.event}</p></div>`; });
            document.getElementById('contentArea').innerHTML = html;
        }

        function renderMindMap() {
            const study = getCurrentStudy();
            if (!study) return;
            let html = `<div class="study-header"><h2>${study.name}</h2><button class="btn" onclick="switchTab('library')" style="margin: 0;">← Indietro</button></div><h2>🧠 Mappa Mentale</h2><div style="display: flex; flex-wrap: wrap; gap: 15px;">`;
            (study.data.mind_map || []).forEach(c => { html += `<div style="background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; padding: 15px 20px; border-radius: 8px; font-weight: bold;">${c}</div>`; });
            html += '</div>';
            document.getElementById('contentArea').innerHTML = html;
        }

        function renderFlashcards() {
            const study = getCurrentStudy();
            if (!study || !study.data.flashcards || study.data.flashcards.length === 0) return;
            const fc = study.data.flashcards[appState.currentFlashcard];
            const prog = ((appState.currentFlashcard + 1) / study.data.flashcards.length * 100).toFixed(0);
            let html = `<div class="study-header"><h2>${study.name}</h2><button class="btn" onclick="switchTab('library')" style="margin: 0;">← Indietro</button></div>
                <div class="progress-bar"><div class="progress-fill" style="width: ${prog}%"></div></div>
                <p style="text-align: center;">Flashcard ${appState.currentFlashcard + 1}/${study.data.flashcards.length}</p>
                <div class="flashcard" onclick="this.querySelector('.flashcard-inner').classList.toggle('flipped')">
                    <div class="flashcard-inner">
                        <div class="flashcard-front">${fc.q || 'Domanda'}</div>
                        <div class="flashcard-back">${fc.a || 'Risposta'}</div>
                    </div>
                </div>
                <div class="controls">
                    <button class="btn" onclick="prevFlash()" ${appState.currentFlashcard === 0 ? 'disabled' : ''}>← Indietro</button>
                    <button class="btn" onclick="nextFlash()" ${appState.currentFlashcard === study.data.flashcards.length - 1 ? 'disabled' : ''}>Avanti →</button>
                </div>`;
            document.getElementById('contentArea').innerHTML = html;
        }

        function nextFlash() {
            const study = getCurrentStudy();
            if (appState.currentFlashcard < study.data.flashcards.length - 1) { appState.currentFlashcard++; renderFlashcards(); }
        }
        function prevFlash() {
            if (appState.currentFlashcard > 0) { appState.currentFlashcard--; renderFlashcards(); }
        }

        function renderQuiz() {
            const study = getCurrentStudy();
            if (!study || !study.data.quiz || study.data.quiz.length === 0) return;
            const q = study.data.quiz[appState.currentQuiz];
            const prog = ((appState.currentQuiz + 1) / study.data.quiz.length * 100).toFixed(0);
            let html = `<div class="study-header"><h2>${study.name}</h2><button class="btn" onclick="switchTab('library')" style="margin: 0;">← Indietro</button></div>
                <div class="progress-bar"><div class="progress-fill" style="width: ${prog}%"></div></div>
                <p style="text-align: center;">Quiz ${appState.currentQuiz + 1}/${study.data.quiz.length}</p>
                <h3 style="margin: 30px 0;">${q.q || 'Domanda'}</h3>`;
            (q.options || []).forEach((o, i) => { html += `<div class="quiz-option" onclick="checkAns(${i}, ${q.correct})">${o}</div>`; });
            document.getElementById('contentArea').innerHTML = html;
        }

        function checkAns(sel, corr) {
            if (sel === corr) { appState.quizScore++; alert('✅ Corretto!'); } else { alert('❌ Sbagliato!'); }
            nextQuiz();
        }

        function nextQuiz() {
            const study = getCurrentStudy();
            if (appState.currentQuiz < study.data.quiz.length - 1) { appState.currentQuiz++; renderQuiz(); }
            else {
                const perc = (appState.quizScore / study.data.quiz.length * 100).toFixed(1);
                document.getElementById('contentArea').innerHTML = `<h2 style="text-align: center;">🏆 Completato!</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0;">
                        <div style="background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                            <div style="font-size: 2em; font-weight: bold;">${appState.quizScore}/${study.data.quiz.length}</div>
                            <div style="font-size: 0.9em; margin-top: 5px;">Corrette</div>
                        </div>
                        <div style="background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                            <div style="font-size: 2em; font-weight: bold;">${perc}%</div>
                            <div style="font-size: 0.9em; margin-top: 5px;">Percentuale</div>
                        </div>
                    </div>
                    <button class="btn" onclick="switchTab('library')" style="width: 100%; margin-top: 20px;">← Torna alla Libreria</button>`;
            }
        }

        function resetApp() {
            document.getElementById('uploadSection').classList.remove('hidden');
            document.getElementById('mainApp').classList.add('hidden');
            document.getElementById('pdfFiles').value = '';
        }
    </script>
</body>
</html>
