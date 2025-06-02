const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 443;

const { httpRequests, requestDuration, deniedRequests } = require("./metrics");

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

res.on("finish", () => {
  httpRequests.inc({
    method: req.method,
    route: req.path,
    status: res.statusCode,
  });
});

const end = requestDuration.startTimer({ method: req.method, route: req.path });
res.on("finish", () => {
  end(); // Stop timer
});
