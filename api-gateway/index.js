const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 443;

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
