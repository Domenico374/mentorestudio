# 🤝 Guida per i Contributori

Grazie per l'interesse nel contribuire a **MentoreStudio**! 🎉

## 📋 Quick Start

### 1. Fork e Clone
```bash
git clone https://github.com/TUO_USERNAME/mentorestudio.git
cd mentorestudio
```

### 2. Crea un Branch
```bash
git checkout -b feature/nome-feature
```

### 3. Fai i Cambiamenti
Modifica i file che ti servono.

### 4. Commit
```bash
git commit -m "feat: descrizione del cambio"
```

### 5. Push e Pull Request
```bash
git push origin feature/nome-feature
```

---

## 🎯 Tipi di Contributi Accettati

### 🐛 Bug Report
- Descrizione chiara del bug
- Passaggi per riprodurre
- Screenshot se possibile

### 💡 Feature Request
- Perché è utile?
- Come dovrebbe funzionare?

### 📚 Documentazione
- Miglioramenti al README
- Guide aggiornate

### 🎨 Design & UX
- Miglioramenti interfaccia
- Accessibilità

### ⚡ Performance
- Ottimizzazioni codice

---

## 💻 Linee Guida per il Codice

### JavaScript
```javascript
// ✅ BUONO
function generateContent(apiKey) {
  const textChunk = appState.pdfText.substring(0, 4000);
  return processData(textChunk);
}
```

**Regole:**
- Nomi chiari e descrittivi
- Commenta codice complesso
- Usa `const` di default
- Usa `===` instead of `==`

---

## 📬 Commit Message

**Formato Conventional Commits:**

```bash
git commit -m "feat(flashcards): aggiungi flip animation"
git commit -m "fix(quiz): correggi scoring"
git commit -m "docs(readme): aggiorna istruzioni"
```

---

## ✅ Checklist

- [ ] Codice testato
- [ ] Nessun warning
- [ ] Commit message chiaro
- [ ] Documentazione aggiornata

---

Grazie! ❤️
