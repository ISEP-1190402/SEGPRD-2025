const mongoose = require("mongoose");

const policySchema = new mongoose.Schema({
  role: String,
  permissions: [String],
});

module.exports = mongoose.model("Policy", policySchema);
