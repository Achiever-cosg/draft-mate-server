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

  const COHERE_API_KEY = process.env.COHERE_API_KEY;

  const prompt = `Please write a smart, human-like 'reply mail to this' email in a professional tone. 
Keep it in not more than 3 short paragraphs. 
Avoids adding any boilerplate or extra lines after the sign-off (like links, disclaimers, or taglines`;

  const { emailContent } = req.body;

  if (!emailContent) {
    return res.status(400).json({ error: 'Missing emailContent in request body' });
  }

  try {
    const response = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${COHERE_API_KEY}`
      },
      body: JSON.stringify({
        model: "command",
        prompt: `${prompt}: \n\n${emailContent}`,
        max_tokens: 3000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Cohere proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
