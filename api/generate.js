export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { book, author, focus, duration } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) return res.status(500).json({ error: 'API key missing', text: '' });

  const prompt = `أنت مساعد محتوى متخصص لقناة FGB Root على يوتيوب وتيك توك عن الثروة والمال باللهجة المصرية.

الكتاب: "${book}" ${author ? 'للمؤلف ' + author : ''}
مدة الفيديو: ${duration} دقائق
${focus ? 'تركيز على: ' + focus : ''}

اكتب المحتوى التالي بالضبط مستخدماً هذه العناوين بالترتيب (لازم تكتب كل section):

===MAIN_TITLE===
عنوان واحد عربي جذاب

===ALT_TITLES===
3 عناوين بديلة كل واحد في سطر

===HOOK===
جملة افتتاحية صادمة باللهجة المصرية للثواني الأولى

===SCRIPT===
سكريبت كامل مدة ${duration} دقائق باللهجة المصرية مع أمثلة من الراتب والإيجار والجواز

===DESCRIPTION===
وصف يوتيوب 4 جمل بالعربي
---
وصف تيك توك 2 جمل

===HASHTAGS===
هاشتاقات عربية وانجليزية في سطر

===THUMBNAIL_1===
وصف فكرة الثومبنيل الأولى

===THUMBNAIL_2===
وصف فكرة الثومبنيل الثانية

===THUMBNAIL_3===
وصف فكرة الثومبنيل الثالثة

===NOTEBOOKLM===
برومبت كامل لـ NotebookLM بالعربي لتوليد سكريبت عامية مصرية`;

  // جرب أكتر من model
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b', 
    'gemini-1.0-pro'
  ];

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.9, maxOutputTokens: 8192 }
          })
        }
      );
      const data = await response.json();
      
      if (data.error) {
        console.log(`Model ${model} error: ${data.error.message?.substring(0, 100)}`);
        continue; // جرب الـ model التاني
      }
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text.length > 100) {
        console.log(`Success with model: ${model}, text length: ${text.length}`);
        return res.status(200).json({ text });
      }
    } catch (err) {
      console.log(`Model ${model} fetch error: ${err.message}`);
      continue;
    }
  }
  
  return res.status(200).json({ text: '', error: 'All models quota exceeded. Try again tomorrow.' });
        }
