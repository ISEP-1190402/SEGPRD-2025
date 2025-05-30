const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const {
  materialSchema,
  gradeSchema,
  announcementSchema,
  formSchema
} = require('../validation/resourceValidation');

// Course materials endpoint (GET paginado)
router.get('/materials', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const materials = await Resource.find({ type: 'material' })
    .skip((page - 1) * limit)
    .limit(limit);
  res.json(materials);
});

// Criar novo material (POST)
router.post('/materials', async (req, res) => {
  const { error } = materialSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const resource = new Resource({
    ...req.body,
    type: 'material',
    uploadedAt: new Date()
  });
  await resource.save();
  res.status(201).json(resource);
});

// Grade submission endpoint
router.post('/grades', async (req, res) => {
  const { error } = gradeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const { studentId, course, grade, access } = req.body;
  const resource = new Resource({
    type: 'grade',
    studentId,
    course,
    grade,
    access: access || ['professor'],
    submittedAt: new Date()
  });
  await resource.save();
  res.status(201).json(resource);
});

// Department announcements (GET)
router.get('/announcements', async (req, res) => {
  const announcements = await Resource.find({ type: 'announcement' });
  res.json(announcements);
});

// Criar novo announcement (POST)
router.post('/announcements', async (req, res) => {
  const { error } = announcementSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const resource = new Resource({
    ...req.body,
    type: 'announcement',
    postedAt: new Date()
  });
  await resource.save();
  res.status(201).json(resource);
});

// Administrative forms (GET)
router.get('/forms', async (req, res) => {
  const forms = await Resource.find({ type: 'form' });
  res.json(forms);
});

// Criar novo form (POST)
router.post('/forms', async (req, res) => {
  const { error } = formSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  const resource = new Resource({
    ...req.body,
    type: 'form',
    lastUpdated: new Date()
  });
  await resource.save();
  res.status(201).json(resource);
});

module.exports = router;
