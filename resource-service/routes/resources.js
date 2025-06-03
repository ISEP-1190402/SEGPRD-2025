const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const ResourceVersion = require('../models/ResourceVersion');
const saveResourceVersion = require('../utils/versionResource');
const {
  materialSchema,
  gradeSchema,
  announcementSchema,
  formSchema
} = require('../validation/resourceValidation');

// GET paginated materials
router.get('/materials', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const materials = await Resource.find({ type: 'material' })
    .skip((page - 1) * limit)
    .limit(limit);
  res.json(materials);
});

// POST new material
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

// POST new grade
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

// GET announcements
router.get('/announcements', async (req, res) => {
  const announcements = await Resource.find({ type: 'announcement' });
  res.json(announcements);
});

// POST new announcement
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

// GET forms
router.get('/forms', async (req, res) => {
  const forms = await Resource.find({ type: 'form' });
  res.json(forms);
});

// POST new form
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

/* ========== VERSIONAMENTO ========== */

// PUT /resources/:id
router.put('/:id', async (req, res) => {
  try {
    // 1. Buscar o recurso original
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    // 2. Buscar a versão mais recente deste recurso
    const lastVersion = await ResourceVersion.find({ resourceId: resource._id })
      .sort({ version: -1 })
      .limit(1);
    const newVersionNumber = lastVersion.length > 0 ? lastVersion[0].version + 1 : 1;

    // 3. Guardar versão antiga
    const versionData = resource.toObject();
    delete versionData._id; // <<--- REMOVE O _id !!!
    await ResourceVersion.create({
      resourceId: resource._id,
      ...versionData,
      version: newVersionNumber,
      updatedAt: new Date()
    });

    // 4. Atualizar o recurso atual
    Object.assign(resource, req.body, { lastUpdated: new Date() });
    await resource.save();

    res.json(resource);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Listar versões antigas de um recurso
router.get('/:id/versions', async (req, res) => {
  try {
    const versions = await ResourceVersion.find({ resourceId: req.params.id }).sort({ version: -1 });
    res.json(versions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /resources/:id
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json(resource);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID format' });
  }
});


module.exports = router;
