const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['material', 'grade', 'announcement', 'form'],
    required: [true, 'Type is required'],
  },
  title: {
    type: String,
    required: function() { return ['material', 'announcement', 'form'].includes(this.type); },
    minlength: [3, 'Title must have at least 3 characters'],
    maxlength: [100, 'Title can have at most 100 characters']
  },
  course: {
    type: String,
    required: function() { return ['material', 'grade'].includes(this.type); },
    match: [/^[A-Z]{3}\d{3}$/, 'Course must be like CSE101']
  },
  studentId: {
    type: String,
    required: function() { return this.type === 'grade'; },
    match: [/^stu\d{3}$/, 'StudentId must be like stu001']
  },
  grade: {
    type: Number,
    min: [10, 'Grade must be at least 10'],
    max: [20, 'Grade can be at most 20'],
    required: function() { return this.type === 'grade'; }
  },
  file: {
    type: String,
    required: function() { return this.type === 'material'; },
    match: [/\.pdf$/, 'File must be a PDF']
  },
  content: {
    type: String,
    required: function() { return this.type === 'announcement'; }
  },
  formUrl: {
    type: String,
    required: function() { return this.type === 'form'; },
    match: [/\.pdf$/, 'Form URL must be a PDF']
  },
  access: {
    type: [String],
    enum: ['student', 'professor', 'admin'],
    required: true,
    validate: [a => a.length > 0, 'Access array cannot be empty']
  },
  uploadedAt: Date,
  submittedAt: Date,
  postedAt: Date,
  lastUpdated: Date
});

module.exports = mongoose.model('Resource', resourceSchema);
