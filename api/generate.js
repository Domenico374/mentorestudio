// Serverless Function per Vercel - /api/generate.js
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { text } = req.body
    if (!text || text.length === 0) {
      return res.status(400).json({ error: 'Testo vuoto' })
    }

    const textChunk = text.substring(0, 4000)
    const prompt = `Analizza questo testo e genera SOLO JSON...` // (completo nell'artefatto)

    const message = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{role: "system", content: "Rispondi SOLO con JSON valido"}, {role: "user", content: prompt}],
      temperature: 0.7,
      max_tokens: 2000
    })

    const text_response = message.choices[0].message.content
    const jsonMatch = text_response.match(/\{[\s\S]*\}/)
    
    if (!jsonMatch) {
      return res.status(400).json({ error: 'JSON non trovato' })
    }

    const data = JSON.parse(jsonMatch[0])
    res.status(200).json(data)

  } catch (error) {
    console.error('Errore:', error)
    res.status(500).json({ error: error.message })
  }
}
