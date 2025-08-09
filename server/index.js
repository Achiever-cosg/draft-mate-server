
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = process.env.MODEL_NAME;

export default async function handler(req, res) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'Proxy server is up and running....'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
  const prompt = "Draft an email reply in a formal and respectful business tone. Do not include a subject line. Disregard all footers, disclaimers, and unsubscribe links from the original email.";

  const { emailContent } = req.body;

  if (!emailContent) {
    return res.status(400).json({ error: 'Missing emailContent in request body' });
  }

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `${prompt}: \n\n${emailContent}`,
          },
        ],
      },
    ],
  };

  // console.log("API call started...");

  try {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // console.log("API call completed: ", response.status);

    if (!response.ok) {
      const err = await response.json();
      console.error('Response not OK:', error);
      return res.status(response.status).json({ error: 'error' });
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    // console.log("generated data: ", generatedText);

    return res.status(200).json(data);

  } catch (error) {
    console.error('ProxyServer fetch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
