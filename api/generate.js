export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { book, author, focus, duration } = req.body;
  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'API key missing', text: '' });

  const prompt = `أنت مساعد محتوى متخصص لقناة FGB Root على يوتيوب وتيك توك عن الثروة والمال باللهجة المصرية العامية.

الكتاب: "${book}" ${author ? 'للمؤلف ' + author : ''}
مدة الفيديو: ${duration} دقائق
${focus ? 'تركيز على: ' + focus : ''}

اكتب المحتوى التالي مستخدماً هذه العناوين بالترتيب بدون أي إضافات:

===MAIN_TITLE===
عنوان واحد عربي جذاب يشد الجمهور المصري

===ALT_TITLES===
عنوان بديل 1
عنوان بديل 2
عنوان بديل 3

===HOOK===
جملة افتتاحية صادمة باللهجة المصرية للثواني الخمس الأولى

===SCRIPT===
سكريبت كامل مدة ${duration} دقائق باللهجة المصرية العامية مع أمثلة حقيقية من الراتب والإيجار والجواز والحياة اليومية في مصر. هيكل: هوك 30 ثانية، المشكلة دقيقة، الفكرة الأساسية دقيقتين، تطبيق عملي دقيقتين، CTA للاشتراك في @FGBRoot

===DESCRIPTION===
وصف يوتيوب 4 جمل بالعربي الفصيح
---
وصف تيك توك 2 جمل بالعامية المصرية

===HASHTAGS===
هاشتاقات عربية وإنجليزية في سطر واحد

===THUMBNAIL_1===
وصف تفصيلي لفكرة الثومبنيل الأولى

===THUMBNAIL_2===
وصف تفصيلي لفكرة الثومبنيل الثانية

===THUMBNAIL_3===
وصف تفصيلي لفكرة الثومبنيل الثالثة

===NOTEBOOKLM===
برومبت كامل باللغة العربية لرفعه على NotebookLM لتوليد سكريبت صوتي بالعامية المصرية لهذا الكتاب`;

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
