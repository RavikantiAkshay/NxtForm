import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  blockId: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // Can store string, number, array (for checkboxes), or boolean
    required: true
  }
}, { _id: false }); // Disable _id for subdocuments to keep it clean

const responseSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true,
    index: true // Indexed for faster lookups when Form owner views all responses
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Indexed for faster lookups when checking if user already submitted
  },
  answers: [answerSchema]
}, {
  timestamps: true
});

// Ensure a user can only submit once per form. 
// If they revisit, we will UPDATE this single document.
responseSchema.index({ formId: 1, userId: 1 }, { unique: true });

const Response = mongoose.model('Response', responseSchema);
export default Response;
