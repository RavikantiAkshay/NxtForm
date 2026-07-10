import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { Groq } from 'groq-sdk';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();
router.use(aiLimiter);

const FORM_GENERATION_PROMPT = `
You are an expert form designer AI for the NxtForm platform.
Your task is to generate a JSON object with a single key "blocks" which contains an array of form blocks based on the user's prompt.

Here is the COMPLETE list of supported block types and their properties:
- text: Short text input (properties: id, type, typeName, title, required)
- longtext: Long text/paragraph (properties: id, type, typeName, title, required)
- email: Email address (properties: id, type, typeName, title, required)
- number: Number input (properties: id, type, typeName, title, required)
- phone: Phone number (properties: id, type, typeName, title, required)
- url: Website link (properties: id, type, typeName, title, required)
- fullname: First and Last name (properties: id, type, typeName, title, required)
- address: Physical address (properties: id, type, typeName, title, required)
- company: Company Name (properties: id, type, typeName, title, required)
- date: Date picker (properties: id, type, typeName, title, required)
- time: Time picker (properties: id, type, typeName, title, required)
- date_range: Date range (properties: id, type, typeName, title, required)
- country: Country Selector (properties: id, type, typeName, title, required)
- language: Language Selector (properties: id, type, typeName, title, required)
- password: Password input (properties: id, type, typeName, title, required)
- choice: Multiple choice / Radio (properties: id, type, typeName, title, required, options: [{label: string, value: string}], allowOther: boolean)
- checkbox: Checkboxes (properties: id, type, typeName, title, required, options: [{label: string, value: string}], allowOther: boolean)
- dropdown: Dropdown menu (properties: id, type, typeName, title, required, options: [{label: string, value: string}], allowOther: boolean)
- yes_no: Yes/No Toggle (properties: id, type, typeName, title, required)
- terms: Terms & Conditions agreement (properties: id, type, typeName, title, required, options: [{label: string, value: 'agreed'}])
- fileupload: File Upload for resumes/docs (properties: id, type, typeName, title, required)
- signature: Signature Pad (properties: id, type, typeName, title, required)
- credit_card: Credit Card Payment (properties: id, type, typeName, title, required)
- rating_stars: 5-star rating (properties: id, type, typeName, title, required)
- emoji_rating: Emoji Rating (properties: id, type, typeName, title, required)
- nps: NPS (0-10) (properties: id, type, typeName, title, required)
- linear_scale: 1-10 scale (properties: id, type, typeName, title, required)
- slider: Slider (properties: id, type, typeName, title, required)
- counter: Counter (+/-) (properties: id, type, typeName, title, required)
- tags: Tags / Chips (properties: id, type, typeName, title, required)
- color_picker: Color Picker (properties: id, type, typeName, title, required)
- otp: OTP Input (properties: id, type, typeName, title, required)
- matrix: Matrix / Grid (properties: id, type, typeName, title, required)
- heading: Section Heading (properties: id, type, typeName, title)
- divider: Divider (properties: id, type, typeName)

Important instructions:
1. ALWAYS start with a 'welcome' block (type: 'welcome', typeName: 'Welcome Screen', title: <Greeting>, description: <Brief intro>, buttonText: 'Start').
2. ALWAYS generate a unique 'id' for each block (e.g., 'email-123456', 'text-987654').
3. For options in choice/checkbox/dropdown/terms, value should be something like 'opt-1', 'opt-2' and label should be the actual option text. For terms, the single option label should be something like "I agree to the Terms & Conditions and Privacy Policy".
4. Set 'required' to true for essential fields like Name, Email, Phone, etc.
5. Set 'page' to 1 for all blocks (e.g., page: 1).
6. REPHRASE user prompts into highly professional titles. (e.g. Instead of "CGPA", use "Current CGPA". Instead of "Willing to accept locations", use "Which of the following locations are you willing to accept?").
7. USE SPECIALIZED TEMPLATES: 
   - If the user asks for Terms & Conditions or agreement, YOU MUST ABSOLUTELY USE the 'terms' type. DO NOT UNDER ANY CIRCUMSTANCE use 'checkbox' or 'choice' for agreements.
   - If the user asks for a resume, use 'fileupload'. 
   - If they ask for Yes/No questions, use 'yes_no'. 
   - If they ask for a Country or Language, use 'country' or 'language'.
   Do not reinvent these with generic checkboxes, choices, or text blocks!
8. BE SMART WITH OPTIONS: When asking for fields with known sets of options (like Branch, Department, State, etc.), ALWAYS use 'dropdown' or 'choice', populate it with 5-6 common realistic options, and set 'allowOther: true' to capture edge cases. Do not use generic 'text' for these.
9. DO NOT ADD AN "OTHER" OPTION TO THE ARRAY: If you set 'allowOther: true', the UI automatically renders the "Other" option. DO NOT include an option with label "Other" or "Others" in the options array itself.
10. Make sure the output is strictly a valid JSON object containing the "blocks" array.
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

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI generation timed out')), 25000)
    );

    const completion = await Promise.race([
      groq.chat.completions.create({
        messages: [
          { role: "system", content: FORM_GENERATION_PROMPT },
          { role: "user", content: `Generate a form for: ${prompt}` }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        response_format: { type: "json_object" }
      }),
      timeoutPromise
    ]);

    let jsonResponse = completion.choices[0].message.content;
    
    // Strict validation
    try {
      const parsed = JSON.parse(jsonResponse);
      let blocksToReturn = null;

      if (parsed.blocks && Array.isArray(parsed.blocks)) {
         blocksToReturn = parsed.blocks;
      } else if (Array.isArray(parsed)) {
         blocksToReturn = parsed;
      } else {
         const firstKey = Object.keys(parsed)[0];
         if (firstKey && Array.isArray(parsed[firstKey])) {
             blocksToReturn = parsed[firstKey];
         }
      }

      if (blocksToReturn) {
        // Validate each block
        const isValid = blocksToReturn.every(b => typeof b === 'object' && b !== null && typeof b.id === 'string' && typeof b.type === 'string');
        if (!isValid) {
          return res.status(500).json({ message: 'AI generated invalid block structure.' });
        }
        return res.status(200).json(blocksToReturn);
      }
      
      res.status(500).json({ message: 'Failed to parse AI output structure.', output: parsed });
    } catch (e) {
       res.status(500).json({ message: 'Failed to parse AI output.' });
    }

  } catch (error) {
    if (error.message === 'AI generation timed out') {
      return res.status(504).json({ message: 'Request to AI provider timed out. Please try again.' });
    }
    console.error('Error generating form with AI:', error);
    res.status(500).json({ message: 'Server error during AI generation.' });
  }
});

export default router;
