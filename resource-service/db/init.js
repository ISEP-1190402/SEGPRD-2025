const mongoose = require('mongoose');
const Resource = require('../models/Resource');
require('dotenv').config();

async function initData() {
  await mongoose.connect(process.env.MONGODB_URI);

  await Resource.deleteMany({});

  const demoData = [
    {
      type: 'material',
      title: 'Intro to ZTA',
      course: 'SEG101',
      file: 'intro.pdf',
      access: ['student', 'professor'],
      uploadedAt: new Date()
    },
    {
      type: 'announcement',
      title: 'Exam Info',
      content: 'Exam will be held on June 15.',
      access: ['student', 'professor', 'admin'],
      postedAt: new Date()
    },
    {
      type: 'form',
      title: 'Reimbursement Request',
      formUrl: 'form1.pdf',
      access: ['admin'],
      lastUpdated: new Date()
    }
  ];

  await Resource.insertMany(demoData);
  console.log('Database initialized with demo data');
  process.exit();
}

initData().catch(err => {
  console.error(err);
  process.exit(1);
});