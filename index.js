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

let prompt = `Please write a smart, human-like reply mail to this email in a professional tone. 
    Keep it in not more than 3 short paragraphs. 
    Avoids adding any boilerplate or extra lines after the sign-off (like links, disclaimers, or taglines`


app.post('/api/proxy', async (req, res) => {
    const { emailContent } = req.body;

    if (!emailContent) {
        return res.status(400).json({ error: 'Missing emailContent in request body' });
    }

    // console.log("API response started...");

    try {
        const response = await fetch("https://api.cohere.ai/v1/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${COHERE_API_KEY}`  // Replace with your Cohere API key
            },
            body: JSON.stringify({
                model: "command",  // or "command-light" for faster responses
                prompt: `${prompt}: \n\n${emailContent}`,
                max_tokens: 3000,
                temperature: 0.7
            })
        });
        // console.log("response generated..", response);
        if (!response.ok) {
            const err = await response.text();
            // console.log(err);
            return res.status(response.status).json({ error: err });
        }
        
        // console.log("response sent..");
        const data = await response.json();
        res.json(data);
    } catch (error) {
        // console.error('OpenAI proxy error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Proxy server is up and running....'
	});
});

app.listen(PORT, () => {
	console.log(`Proxy server listening on port ${PORT}`);
})

