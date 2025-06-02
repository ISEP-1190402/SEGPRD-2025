const client = require("prom-client");

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

// Counter: Number of policy checks
const policyChecks = new client.Counter({
  name: "policy_checks_total",
  help: "Number of policy evaluation attempts",
  labelNames: ["result", "policy", "resource", "method"], // Add labels as needed
});

// Counter: Access decisions (allow / deny)
const accessDecisions = new client.Counter({
  name: "access_decisions_total",
  help: "Total access decisions made",
  labelNames: ["decision", "reason"], // decision: allow/deny, reason: role_mismatch, missing_claims
});

// Histogram: Response duration for policy evaluation
const policyEvaluationDuration = new client.Histogram({
  name: "policy_evaluation_duration_seconds",
  help: "Duration of policy evaluations in seconds",
  labelNames: ["policy"],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.5, 1, 2], // Customize as needed
});

module.exports = {
  client,
  policyChecks,
  accessDecisions,
  policyEvaluationDuration,
};
