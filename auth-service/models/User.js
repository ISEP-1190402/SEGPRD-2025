const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Bcrypt hashed
  role: {
    type: String,
    enum: ["student", "professor", "admin"],
    required: true,
  },
  mfaSecret: { type: String },
  mfaEnabled: { type: Boolean, default: false },
  attributes: {
    enrolledCourses: [String], // For students
    teachingCourses: [String], // For professors
    department: String,
  },
  lastLogin: Date,
  devices: [
    {
      deviceId: String,
      userAgent: String,
      lastUsed: Date,
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
