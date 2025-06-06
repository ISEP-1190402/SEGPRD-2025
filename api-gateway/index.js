const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const client = require("prom-client");

const app = express();
const PORT = process.env.PORT || 443;

const { httpRequests, requestDuration } = require("./metrics");

// Middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Gateway is running 🚀");
});

app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});

// Middleware to count requests
app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequests.inc({
      method: req.method,
      route: req.route ? req.route.path : req.path, // Fallback if route not defined
      status: res.statusCode,
    });
  });
  next();
});

// Middleware to start/stop timer
app.use((req, res, next) => {
  // Start timer when request begins
  const end = requestDuration.startTimer({
    method: req.method,
    route: req.route ? req.route.path : req.path, // fallback to req.path
  });

  // Stop timer when response is finished
  res.on("finish", () => {
    end({ status_code: res.statusCode });
  });

  next();
});

// Expose metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});
