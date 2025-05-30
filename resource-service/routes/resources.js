const express = require('express');
const router = express.Router();
const Resource = require('../models/resource');

// Course materials endpoint
router.get('/materials', async (req, res) => {
  const materials = await Resource.find({ type: 'material' });
  res.json(materials);
});

// Grade submission endpoint
router.post('/grades', async (req, res) => {
  const { studentId, course, grade } = req.body;
  const resource = new Resource({
    type: 'grade',
    studentId,
    course,
    grade,
    access: ['professor'],
    submittedAt: new Date()
  });
  await resource.save();
  res.status(201).json(resource);
});

// Department announcements
router.get('/announcements', async (req, res) => {
  const announcements = await Resource.find({ type: 'announcement' });
  res.json(announcements);
});

// Administrative forms
router.get('/forms', async (req, res) => {
  const forms = await Resource.find({ type: 'form' });
  res.json(forms);
});

module.exports = router;
