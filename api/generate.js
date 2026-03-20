export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { book, author, focus, duration } = req.body;
  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'API key missing', text: '' });

  const prompt = `أنت مساعد محتوى لقناة FGB Root. اكتب المحتوى التالي للكتاب بالضبط بدون أي مقدمة أو كلام إضافي قبل أول section.

الكتاب: "${book}" ${author ? 'للمؤلف ' + author : ''}
مدة الفيديو: ${duration} دقائق
${focus ? 'تركيز على: ' + focus : ''}

ابدأ مباشرة بـ ===MAIN_TITLE=== بدون أي كلام قبلها:

===MAIN_TITLE===
عنوان عربي جذاب باللهجة المصرية

===ALT_TITLES===
عنوان بديل 1
عنوان بديل 2
عنوان بديل 3

===HOOK===
جملة افتتاحية صادمة باللهجة المصرية للثواني الأولى

===SCRIPT===
سكريبت كامل مدة ${duration} دقائق باللهجة المصرية مع أمثلة من الراتب والإيجار والحياة المصرية

===DESCRIPTION===
وصف يوتيوب 4 جمل بالعربي
---
وصف تيك توك 2 جمل بالعامية

===HASHTAGS===
هاشتاقات عربية وانجليزية في سطر

===THUMBNAIL_1===
وصف فكرة الثومبنيل الأولى

===THUMBNAIL_2===
وصف فكرة الثومبنيل الثانية

===THUMBNAIL_3===
وصف فكرة الثومبنيل الثالثة

===NOTEBOOKLM===
برومبت كامل لـ NotebookLM بالعربي`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8000,
        system: 'أنت مساعد محتوى. ابدأ ردك مباشرة بـ ===MAIN_TITLE=== بدون أي مقدمة أو كلام إضافي.',
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    if (data.error) return res.status(200).json({ text: '', error: data.error.message });
    const text = data.content?.[0]?.text || '';
    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: err.message, text: '' });
  }
      }
