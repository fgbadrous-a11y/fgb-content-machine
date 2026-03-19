export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { book, author, focus, duration } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key missing', text: '' });
  }

  const prompt = `أنت مساعد محتوى متخصص لقناة FGB Root على يوتيوب وتيك توك عن الثروة والمال باللهجة المصرية.

الكتاب: "${book}" ${author ? 'للمؤلف ' + author : ''}
مدة الفيديو: ${duration} دقائق
${focus ? 'تركيز على: ' + focus : ''}

اكتب المحتوى التالي بالضبط مستخدماً هذه العناوين بالترتيب:

===MAIN_TITLE===
اكتب عنوان عربي واحد جذاب للفيديو

===ALT_TITLES===
اكتب 3 عناوين بديلة، كل عنوان في سطر منفصل

===HOOK===
اكتب جملة افتتاحية صادمة باللهجة المصرية للثواني الخمس الأولى

===SCRIPT===
اكتب سكريبت كامل مدة ${duration} دقائق باللهجة المصرية العامية مع أمثلة مصرية من الراتب والإيجار والجواز. 
هيكل: هوك 30 ثانية، المشكلة دقيقة، الفكرة الأساسية دقيقتين، التطبيق دقيقتين، CTA اشتراك @FGBRoot

===DESCRIPTION===
اكتب وصف يوتيوب 4-5 جمل بالعربي
---
اكتب وصف تيك توك 2-3 جمل بالعربي

===HASHTAGS===
اكتب هاشتاقات عربية وإنجليزية في سطر واحد

===THUMBNAIL_1===
صف فكرة تصميم الثومبنيل الأولى

===THUMBNAIL_2===
صف فكرة تصميم الثومبنيل الثانية

===THUMBNAIL_3===
صف فكرة تصميم الثومبنيل الثالثة

===NOTEBOOKLM===
اكتب برومبت كامل بالعربي لتحميله في NotebookLM لتوليد سكريبت بالعامية المصرية لهذا الكتاب`;

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.9, 
            maxOutputTokens: 8192,
            topP: 0.95
          }
        })
      }
    );
    
    const data = await response.json();
    console.log('Gemini response status:', response.status);
    console.log('Gemini data keys:', Object.keys(data));
    
    if (data.error) {
      console.error('Gemini error:', JSON.stringify(data.error));
      return res.status(200).json({ text: '', error: data.error.message });
    }
    
    const candidates = data.candidates;
    if (!candidates || candidates.length === 0) {
      console.error('No candidates in response:', JSON.stringify(data).substring(0, 200));
      return res.status(200).json({ text: '', debug: 'no candidates' });
    }
    
    const text = candidates[0]?.content?.parts?.[0]?.text || '';
    console.log('Text length:', text.length);
    console.log('Text preview:', text.substring(0, 100));
    
    res.status(200).json({ text });
  } catch (err) {
    console.error('Fetch error:', err.message);
    res.status(500).json({ error: err.message, text: '' });
  }
}
