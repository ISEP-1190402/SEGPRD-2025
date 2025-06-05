// File: resource-service/models/ResourceVersion.js

const mongoose = require('mongoose');

const resourceVersionSchema = new mongoose.Schema({
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true
  },
  type: {
    type: String,
    enum: ['material', 'grade', 'announcement', 'form'],
    required: true
  },
  title: String,
  course: String,
  studentId: String,
  grade: Number,
  file: String,
  content: String,
  formUrl: String,
  access: {
    type: [String],
    enum: ['student', 'professor', 'admin']
  },
  uploadedAt: Date,
  submittedAt: Date,
  postedAt: Date,
  lastUpdated: Date,
  version: {
    type: Number,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ResourceVersion', resourceVersionSchema);
