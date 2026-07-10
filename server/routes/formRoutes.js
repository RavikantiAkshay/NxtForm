import express from 'express';
import Form from '../models/Form.js';
import { protect } from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// @desc    Create a new form
// @route   POST /api/forms
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, mode, blocks } = req.body;
    
    // Input Validation
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: 'Valid title is required' });
    }
    if (mode && !['classic', 'conversational'].includes(mode)) {
      return res.status(400).json({ message: 'Invalid mode' });
    }
    if (blocks && !Array.isArray(blocks)) {
      return res.status(400).json({ message: 'Blocks must be an array' });
    }
    
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

    // Input Validation
    if (title !== undefined && typeof title !== 'string') {
      return res.status(400).json({ message: 'Invalid title type' });
    }
    if (mode !== undefined && !['classic', 'conversational'].includes(mode)) {
      return res.status(400).json({ message: 'Invalid mode' });
    }
    if (blocks !== undefined && !Array.isArray(blocks)) {
      return res.status(400).json({ message: 'Blocks must be an array' });
    }
    
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
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    if (!form.isPublished) {
      let isOwner = false;
      let token;
      
      if (req.cookies && req.cookies.nxtform_token) {
        token = req.cookies.nxtform_token;
      } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          if (decoded.id === form.userId.toString()) {
            isOwner = true;
          }
        } catch (e) {
          // invalid token, ignore
        }
      }

      if (!isOwner) {
        return res.status(403).json({ message: 'This form is not published yet' });
      }
    }

    res.json(form);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a form
// @route   DELETE /api/forms/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (form) {
      if (form.userId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to delete this form' });
      }

      await form.deleteOne();
      res.json({ message: 'Form removed' });
    } else {
      res.status(404).json({ message: 'Form not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
