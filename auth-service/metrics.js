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
  labelNames: ["result"], // valid / invalid
});

const deniedRequests = new client.Counter({
  name: "access_denied_total",
  help: "Number of denied access requests",
  labelNames: ["reason"], // unauthorized / forbidden / invalid_signature
});

// Expose metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

module.exports = { loginAttempts, jwtVerifications, deniedRequests };
