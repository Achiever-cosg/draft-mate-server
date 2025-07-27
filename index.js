import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const COHERE_API_KEY = process.env.COHERE_API_KEY;


app.use(cors({ origin: '*' }));

app.use(express.json());

let prompt1 = `Please write a reply to this email in a professional tone. Keep it in not more than 3 short paras. 
    Please ignore the footer stuffs mentioned in the mail, such as unsubscribe, etc`

app.post('/api/proxy', async (req, res) => {
    const { emailContent } = req.body;

    if (!emailContent) {
        return res.status(400).json({ error: 'Missing emailContent in request body' });
    }

    console.log("API response started...");

    try {
        const response = await fetch("https://api.cohere.ai/v1/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${COHERE_API_KEY}`  // Replace with your Cohere API key
            },
            body: JSON.stringify({
                model: "command",  // or "command-light" for faster responses
                prompt: `${prompt1}: \n\n${emailContent}`,
                max_tokens: 3000,
                temperature: 0.7
            })
        });
        console.log("response generated..", response);
        if (!response.ok) {
            const err = await response.text();
            console.log(err);
            return res.status(response.status).json({ error: err });
        }
        
        console.log("response sent..");
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('OpenAI proxy error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/', (req, res) => {
    res.status(200).json({ message: 'On the default page' });
})

app.listen(PORT, () => {
    console.log(`Proxy server listening on port ${PORT}`);
});

