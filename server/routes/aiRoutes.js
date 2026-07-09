import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { Groq } from 'groq-sdk';

const router = express.Router();

const FORM_GENERATION_PROMPT = `
You are an expert form designer AI for the NxtForm platform.
Your task is to generate a JSON object with a single key "blocks" which contains an array of form blocks based on the user's prompt.

Here are the supported block types and their properties:
- text: Short text input (properties: id, type, typeName, title, required)
- longtext: Long text/paragraph (properties: id, type, typeName, title, required)
- email: Email address (properties: id, type, typeName, title, required)
- number: Number input (properties: id, type, typeName, title, required)
- phone: Phone number (properties: id, type, typeName, title, required)
- url: Website link (properties: id, type, typeName, title, required)
- choice: Multiple choice / Radio (properties: id, type, typeName, title, required, options: [{label: string, value: string}])
- checkbox: Checkboxes (properties: id, type, typeName, title, required, options: [{label: string, value: string}])
- dropdown: Dropdown menu (properties: id, type, typeName, title, required, options: [{label: string, value: string}])
- rating_stars: 5-star rating (properties: id, type, typeName, title, required)
- linear_scale: 1-10 scale (properties: id, type, typeName, title, required)
- date: Date picker (properties: id, type, typeName, title, required)
- upload: File upload (properties: id, type, typeName, title, required, description: string)
- fullname: First and Last name (properties: id, type, typeName, title, required)
- address: Physical address (properties: id, type, typeName, title, required)

Important instructions:
1. ALWAYS start with a 'welcome' block (type: 'welcome', typeName: 'Welcome Screen', title: <Greeting>, description: <Brief intro>, buttonText: 'Start').
2. ALWAYS generate a unique 'id' for each block (e.g., 'email-123456', 'text-987654').
3. For options in choice/checkbox/dropdown, value should be something like 'opt-1', 'opt-2' and label should be the actual option text.
4. Set 'required' to true for essential fields like Name, Email, Phone, etc.
5. Make sure the output is strictly a valid JSON object containing the "blocks" array.
`;

// @desc    Generate form blocks using AI
// @route   POST /api/ai/generate-form
// @access  Private
router.post('/generate-form', protect, async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: FORM_GENERATION_PROMPT
        },
        {
          role: "user",
          content: `Generate a form for: ${prompt}`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    let jsonResponse = completion.choices[0].message.content;
    
    // Fallback parsing just in case response_format wraps it in an object
    try {
      const parsed = JSON.parse(jsonResponse);
      if (parsed.blocks && Array.isArray(parsed.blocks)) {
         res.status(200).json(parsed.blocks);
         return;
      }
      if (Array.isArray(parsed)) {
         res.status(200).json(parsed);
         return;
      }
      
      // If it's an object with some arbitrary key
      const firstKey = Object.keys(parsed)[0];
      if (firstKey && Array.isArray(parsed[firstKey])) {
          res.status(200).json(parsed[firstKey]);
          return;
      }
      
      res.status(500).json({ message: 'Failed to parse AI output structure.', output: parsed });
    } catch (e) {
       // if it failed to parse as JSON, but we asked for json_object, that's weird.
       res.status(500).json({ message: 'Failed to parse AI output.' });
    }

  } catch (error) {
    console.error('Error generating form with AI:', error);
    res.status(500).json({ message: 'Server error during AI generation.' });
  }
});

export default router;
