import mongoose from 'mongoose';

const formBlockSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  typeName: { type: String, required: true },
  icon: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  required: { type: Boolean, default: false },
  placeholder: { type: String },
  options: [{
    value: String,
    label: String
  }],
  aiLogic: { type: String },
  buttonText: { type: String },
  page: { type: Number, default: 1 }
});

const formSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'Untitled Form'
  },
  mode: {
    type: String,
    enum: ['conversational', 'classic'],
    default: 'conversational'
  },
  blocks: [formBlockSchema],
  isPublished: {
    type: Boolean,
    default: false
  },
  theme: {
    primaryColor: { type: String, default: '#8b5cf6' },
    backgroundColor: { type: String, default: '#0a0a0a' }
  }
}, {
  timestamps: true
});

const Form = mongoose.model('Form', formSchema);
export default Form;
