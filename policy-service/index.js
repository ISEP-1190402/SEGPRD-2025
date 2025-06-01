const express = require("express");
const mongoose = require("mongoose");
const policyRoutes = require("./routes/policyRouter"); // or your router filename

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Connect to MongoDB (use your MongoDB service URL here)
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected.");
  })
  .catch((err) => console.error(err));

// Use the policy routes
app.use("/", policyRoutes);

app.listen(PORT, () => {
  console.log(`Policy service running on port ${PORT}`);
});
