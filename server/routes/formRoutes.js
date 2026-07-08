import express from 'express';
import Form from '../models/Form.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create a new form
// @route   POST /api/forms
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, mode, blocks } = req.body;
    
    const form = new Form({
      userId: req.user._id,
      title,
      mode,
      blocks
    });

    const createdForm = await form.save();
    res.status(201).json(createdForm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a form
// @route   PUT /api/forms/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { title, mode, blocks, isPublished } = req.body;
    
    const form = await Form.findById(req.params.id);

    if (form) {
      if (form.userId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to edit this form' });
      }

      form.title = title !== undefined ? title : form.title;
      form.mode = mode !== undefined ? mode : form.mode;
      form.blocks = blocks !== undefined ? blocks : form.blocks;
      form.isPublished = isPublished !== undefined ? isPublished : form.isPublished;

      const updatedForm = await form.save();
      res.json(updatedForm);
    } else {
      res.status(404).json({ message: 'Form not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user's forms
// @route   GET /api/forms
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const forms = await Form.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get form by ID (Public for respondents)
// @route   GET /api/forms/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (form) {
      res.json(form);
    } else {
      res.status(404).json({ message: 'Form not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
