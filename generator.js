const axios = require('axios');
const CREATOR = "@Raviya";

// Stability API එකෙන් පින්තූරය ලබාගන්නා ප්‍රධාන ෆන්ක්ෂන් එක
async function fetchImageFromStability(promptText) {
    const apiKey = process.env.STABILITY_API_KEY;
    
    if (!apiKey) {
        throw new Error("API Key is missing! Please set STABILITY_API_KEY in environment variables.");
    }

    const response = await axios.post(
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
        {
            text_prompts: [{ text: promptText }],
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            samples: 1,
            steps: 30,
        },
        {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
        }
    );

    return response.data.artifacts[0].base64;
}

// JSON විදිහට Base64 එක යවන ෆන්ක්ෂන් එක (Bot ලට පාවිච්චි කරන්න ලේසියි)
async function generateImageJSON(promptText) {
    try {
        const base64Image = await fetchImageFromStability(promptText);
        return {
            status: true,
            creator: CREATOR,
            message: "Image generated successfully",
            image_base64: `data:image/png;base64,${base64Image}`
        };
    } catch (error) {
        return {
            status: false,
            creator: CREATOR,
            message: error.response && error.response.data ? error.response.data : error.message
        };
    }
}

// බ්‍රව්සර් එකට කෙලින්ම Image එකක් විදිහටම යවන ෆන්ක්ෂන් එක
async function generateImageStream(promptText, res) {
    try {
        const base64Image = await fetchImageFromStability(promptText);
        const imgBuffer = Buffer.from(base64Image, 'base64');
        
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': imgBuffer.length
        });
        res.end(imgBuffer);
    } catch (error) {
        const errMsg = error.response && error.response.data ? JSON.stringify(error.response.data) : error.message;
        if (!res.headersSent) {
            res.status(500).json({ status: false, creator: CREATOR, message: errMsg });
        }
    }
}

module.exports = { generateImageJSON, generateImageStream, CREATOR };