const express = require("express");
const router = express.Router();
const Policy = require("../models/Policy");

const {
  policyChecks,
  accessDecisions,
  policyEvaluationDuration,
} = require("./metrics");

router.post("/policy/evaluate", async (req, res) => {
  const { role, permission } = req.body;

  try {
    const policy = await Policy.findOne({ role });

    if (!policy) {
      return res
        .status(403)
        .json({ allowed: false, message: "Role not found" });
    }

    const isAllowed = policy.permissions.includes(permission);

    return res.json({
      allowed: isAllowed,
      message: isAllowed ? "Access granted" : "Access denied",
    });
  } catch (error) {
    console.error("Policy evaluation error:", error);
    res.status(500).json({ allowed: false, message: "Server error" });
  }
});

module.exports = router;
