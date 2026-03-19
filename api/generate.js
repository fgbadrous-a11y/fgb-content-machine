export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { book, author, focus, duration } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;
  const prompt = 'You are a content creator for FGB Root YouTube/TikTok channel about wealth in Egyptian Arabic. Book: "' + book + '" by ' + (author||'unknown') + '. Duration: ' + duration + ' min. Generate using EXACTLY these separators: ===MAIN_TITLE=== (one powerful Arabic title) ===ALT_TITLES=== (3 alternative titles) ===HOOK=== (shocking TikTok opener in Egyptian Arabic) ===SCRIPT=== (full script in Egyptian Arabic, short sentences, Egyptian examples) ===DESCRIPTION=== (YouTube desc then --- then TikTok desc) ===HASHTAGS=== (Arabic and English on one line) ===THUMBNAIL_1=== (design idea 1) ===THUMBNAIL_2=== (design idea 2) ===THUMBNAIL_3=== (design idea 3) ===NOTEBOOKLM=== (full prompt for NotebookLM)' + (focus ? ' Focus on: ' + focus : '');
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.8, maxOutputTokens: 8192 } })
    });
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
