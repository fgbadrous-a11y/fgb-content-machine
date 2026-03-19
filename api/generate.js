export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { book, author, focus, duration } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  const prompt = `You are a content creator for FGB Root, a YouTube and TikTok channel about wealth and money in Egyptian Arabic dialect.

Book: "${book}" ${author ? 'by ' + author : ''}
Duration: ${duration} minutes
${focus ? 'Focus: ' + focus : ''}

IMPORTANT: Respond ONLY using these exact section headers. Each section starts with ===SECTION_NAME=== on its own line.

===MAIN_TITLE===
Write one powerful Arabic title that grabs attention (no explanation, just the title)

===ALT_TITLES===
Write 3 alternative Arabic titles, one per line

===HOOK===
Write one shocking sentence in Egyptian Arabic for TikTok first 5 seconds

===SCRIPT===
Write a complete ${duration}-minute video script in Egyptian Arabic dialect. Use short sentences. Include Egyptian examples about salary, rent, marriage. Structure: Hook 30sec, Problem 1min, Main idea 2min, Application 2min, CTA subscribe @FGBRoot

===DESCRIPTION===
Write YouTube description 4-5 sentences in Arabic
---
Write TikTok description 2-3 sentences in Arabic

===HASHTAGS===
Write Arabic and English hashtags on one line

===THUMBNAIL_1===
Describe thumbnail design idea 1

===THUMBNAIL_2===
Describe thumbnail design idea 2

===THUMBNAIL_3===
Describe thumbnail design idea 3

===NOTEBOOKLM===
Write a complete prompt in Arabic to paste in NotebookLM to generate an Egyptian Arabic script for this book`;

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 8192 }
        })
      }
    );
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
          }
