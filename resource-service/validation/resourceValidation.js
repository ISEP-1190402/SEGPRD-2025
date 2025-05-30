const Joi = require('joi');

const materialSchema = Joi.object({
  title: Joi.string().required(),
  course: Joi.string().required(),
  file: Joi.string().required(),
  access: Joi.array().items(Joi.string()).required(),
  uploadedAt: Joi.date()
});

const gradeSchema = Joi.object({
  studentId: Joi.string().required(),
  course: Joi.string().required(),
  grade: Joi.number().min(0).max(20).required(),
  access: Joi.array().items(Joi.string()),
  submittedAt: Joi.date()
});

const announcementSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  access: Joi.array().items(Joi.string()).required(),
  postedAt: Joi.date()
});

const formSchema = Joi.object({
  title: Joi.string().required(),
  formUrl: Joi.string().required(),
  access: Joi.array().items(Joi.string()).required(),
  lastUpdated: Joi.date()
});

module.exports = {
  materialSchema,
  gradeSchema,
  announcementSchema,
  formSchema,
};
