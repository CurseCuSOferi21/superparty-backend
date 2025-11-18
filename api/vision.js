export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
      return res.status(200).end();
  }

  if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
      const { image, mediaType } = req.body;

      if (!image) {
          return res.status(400).json({ error: 'Image data required' });
      }

      // Hardcoded API key for testing
      const OPENAI_KEY = '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';

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_KEY}`
          },
          body: JSON.stringify({
              model: 'gpt-4o',
              max_tokens: 2000,
              messages: [{
                  role: 'user',
                  content: [
                      {
                          type: 'image_url',
                          image_url: {
                              url: `data:${mediaType};base64,${image}`
                          }
                      },
                      {
                          type: 'text',
                          text: `Analizează această imagine și extrage TOATE informațiile pentru un formular de eveniment petrecere copii. Răspunde DOAR cu un obiect JSON valid, fără text suplimentar. Câmpurile sunt:

{
  "dataFormular": "zi/luna/an (ex: 09/11/2025)",
  "nume": "nume client",
  "prenume": "prenume client", 
  "telefon": "telefon cu +40",
  "sursa": "de unde a venit (Facebook/Instagram/Recomandare/Site/TikTok/Alte)",
  "personaj": "personaj petrecere",
  "dataPetrecere": "zi/luna/an",
  "oraPetrecere": "HH:MM (24h)",
  "durata": "numar minute (ex: 180)",
  "varsta": "numar ani",
  "numarCopii": "numar",
  "adresa": "adresa completa",
  "detaliiAdresa": "detalii extra",
  "sofer": "DA/NU",
  "avans": "suma RON",
  "rest": "suma RON", 
  "total": "suma RON",
  "observatii": "text liber"
}

IMPORTANT: Răspunde DOAR cu JSON-ul, fără explicații sau text suplimentar. Dacă un câmp nu e vizibil, pune null.`
                      }
                  ]
              }]
          })
      });

      if (!response.ok) {
          const error = await response.json();
          return res.status(response.status).json({ error: error.error?.message || 'OpenAI API error' });
      }

      const data = await response.json();
      return res.status(200).json(data);

  } catch (error) {
      console.error('Vision error:', error);
      return res.status(500).json({ error: 'Internal server error' });
  }
}
