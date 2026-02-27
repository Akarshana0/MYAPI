const express = require('express');
const { generateImageJSON, generateImageStream, CREATOR } = require('./generator');

const app = express();
app.use(express.json());

const asciiArt = `
  _____            _               _    ____ _____ 
 |  __ \\          (_)             | |  / __ \\_   _|
 | |__) |__ ___   ___   _  __ _   | | | |  | || |  
 |  _  // _\` \\ \\ / / | | |/ _\` |  | | | |  | || |  
 | | \\ \\ (_| |\\ V /| | |_| (_| |  | | | |__| || |_ 
 |_|  \\_\\__,_| \\_/ |_|\\__, |\\__,_|  |_|  \\____/_____|
                       __/ |                       
                      |___/  Created by @Raviya
`;

// Home Route
app.get('/', (req, res) => {
    res.json({
        message: "RAVIYA Stability AI Image API",
        creator: CREATOR,
        status: "Active",
        endpoints: { 
            get_json: "/api/generate?prompt=your_prompt_here",
            view_image: "/api/view?prompt=your_prompt_here" 
        }
    });
});

// JSON Endpoint (Base64 එක ගන්න)
app.get('/api/generate', async (req, res) => {
    const prompt = req.query.prompt;
    if (!prompt) {
        return res.status(400).json({ status: false, creator: CREATOR, message: "Query parameter 'prompt' is missing!" });
    }
    const result = await generateImageJSON(prompt);
    res.json(result);
});

// Direct Image View Endpoint (බ්‍රව්සර් එකෙන් කෙලින්ම බලන්න)
app.get('/api/view', async (req, res) => {
    const prompt = req.query.prompt;
    if (!prompt) {
        return res.status(400).json({ status: false, creator: CREATOR, message: "Query parameter 'prompt' is missing!" });
    }
    await generateImageStream(prompt, res);
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => {
        console.log('\x1b[36m%s\x1b[0m', asciiArt);
        console.log(`✅ Image Generator API running on port 3000`);
    });
}

module.exports = app;