const express = require("express");
const router = express.Router();
const Policy = require("../models/Policy");

const {
  policyChecks,
  accessDecisions,
  policyEvaluationDuration,
} = require("../metrics");

router.post("/policy/evaluate", async (req, res) => {
  const { role, permission } = req.body;

  // Start duration timer
  const endTimer = policyEvaluationDuration.startTimer({
    policy: "access_control",
  });

  try {
    policyChecks.inc({
      result: "attempt",
      policy: "access_control",
      resource: permission.split(":")[1],
      method: permission.split(":")[0],
    });

    const policy = await Policy.findOne({ role });

    if (!policy) {
      accessDecisions.inc({ decision: "deny", reason: "role_not_found" });
      endTimer(); // stop timer
      return res
        .status(403)
        .json({ allowed: false, message: "Role not found" });
    }

    const isAllowed = policy.permissions.includes(permission);

    accessDecisions.inc({
      decision: isAllowed ? "allow" : "deny",
      reason: isAllowed ? "authorized" : "permission_denied",
    });

    return res.json({
      allowed: isAllowed,
      message: isAllowed ? "Access granted" : "Access denied",
    });
  } catch (error) {
    accessDecisions.inc({ decision: "deny", reason: "internal_error" });
    console.error("Policy evaluation error:", error);
    res.status(500).json({ allowed: false, message: "Server error" });
  } finally {
    endTimer(); // stop timer in all cases
  }
});

module.exports = router;
