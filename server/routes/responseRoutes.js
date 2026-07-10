import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Form from '../models/Form.js';
import Response from '../models/Response.js';

const router = express.Router();

// @desc    Submit or update a response for a form
// @route   POST /api/responses/:formId
// @access  Private (Requires login as requested by user)
router.post('/:formId', protect, async (req, res) => {
  try {
    const { formId } = req.params;
    const { answers } = req.body;
    const userId = req.user._id;

    // 1. Verify the form exists and is published
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    if (!form.isPublished) {
      return res.status(403).json({ message: 'This form is no longer accepting responses.' });
    }

    // Validate Answers structure
    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers must be an array' });
    }

    const formBlocks = form.blocks || [];
    const validBlockIds = new Set(formBlocks.map(b => b.id));

    // Check for required fields
    for (const block of formBlocks) {
      if (block.required) {
        const answer = answers.find(a => a.blockId === block.id);
        if (!answer || answer.value === undefined || answer.value === '' || answer.value === null || (Array.isArray(answer.value) && answer.value.length === 0)) {
          return res.status(400).json({ message: `Required field missing: ${block.title}` });
        }
      }
    }

    // Check that all submitted blockIds are valid (or are _other fields for valid blockIds)
    for (const ans of answers) {
      const baseBlockId = ans.blockId.endsWith('_other') ? ans.blockId.replace('_other', '') : ans.blockId;
      if (!validBlockIds.has(baseBlockId)) {
         return res.status(400).json({ message: `Invalid field submitted: ${ans.blockId}` });
      }
    }

    // 2. We use findOneAndUpdate with upsert: true. 
    // If the user already submitted, it updates their answers. If not, it creates a new record.
    const response = await Response.findOneAndUpdate(
      { formId, userId },
      { $set: { answers } },
      { new: true, upsert: true }
    );

    res.status(200).json(response);
  } catch (error) {
    console.error('Error submitting response:', error);
    res.status(500).json({ message: 'Server error while submitting response.' });
  }
});

// @desc    Get the logged-in user's existing response for a form (for editing)
// @route   GET /api/responses/:formId/my-response
// @access  Private
router.get('/:formId/my-response', protect, async (req, res) => {
  try {
    const { formId } = req.params;
    const userId = req.user._id;

    const response = await Response.findOne({ formId, userId });
    
    // If no response is found, return 200 with a null/empty state so the frontend knows it's a new fill
    if (!response) {
      return res.status(200).json(null);
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching user response:', error);
    res.status(500).json({ message: 'Server error while fetching response.' });
  }
});

// @desc    Get ALL responses for a specific form (For the Form Creator's Dashboard)
// @route   GET /api/responses/:formId/all
// @access  Private (Only the form owner can view these)
router.get('/:formId/all', protect, async (req, res) => {
  try {
    const { formId } = req.params;
    
    // Verify the user is the owner of the form
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (form.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view these responses.' });
    }

    // Fetch responses and populate respondent's basic details (name/email) if needed
    const responses = await Response.find({ formId }).populate('userId', 'name email').sort({ createdAt: -1 });
    
    res.status(200).json(responses);
  } catch (error) {
    console.error('Error fetching all responses:', error);
    res.status(500).json({ message: 'Server error while fetching responses.' });
  }
});

export default router;
