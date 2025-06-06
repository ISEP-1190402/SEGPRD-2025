const client = require("prom-client");

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

// Custom counters
const loginAttempts = new client.Counter({
  name: "login_attempts_total",
  help: "Total number of login attempts",
  labelNames: ["status"], // success / failure
});

const jwtVerifications = new client.Counter({
  name: "jwt_verifications_total",
  help: "Total number of JWT verifications",
  labelNames: ["result"], // valid / invalid / missing
});

const deniedRequests = new client.Counter({
  name: "access_denied_total",
  help: "Number of denied access requests",
  labelNames: ["reason"], // unauthorized / forbidden / invalid_token
});

module.exports = { loginAttempts, jwtVerifications, deniedRequests };
