const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  type: { type: String, enum: ['material', 'grade', 'announcement', 'form'], required: true },
  title: String,
  course: String,
  studentId: String,
  grade: Number,
  file: String,
  content: String,
  formUrl: String,
  access: [String],
  uploadedAt: Date,
  submittedAt: Date,
  postedAt: Date,
  lastUpdated: Date
});

module.exports = mongoose.model('Resource', resourceSchema);
