const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
require("dotenv").config();

const app = express();
app.use(express.json());

const User = require("./models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const PORT = process.env.PORT || 3001;

// Connect MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected.");
  })
  .catch((err) => console.error(err));

app.listen(3001, () => {
  console.log("Auth service running on port 3001.");
});

// Helper to generate JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

// Register Route
app.post("/register", async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role)
      return res.status(400).json({ message: "Missing fields" });

    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ username });
    if (!user)
      return res.status(401).json({ message: "Invalid username or password" });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass)
      return res.status(401).json({ message: "Invalid username or password" });

    // If MFA enabled, you can handle that here (simplified below)
    if (user.mfaEnabled) {
      return res
        .status(200)
        .json({ message: "MFA required", mfaRequired: true });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// MFA Setup Route with speakeasy
app.post("/mfa/setup", async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a TOTP secret
    const secret = speakeasy.generateSecret({ length: 20 });

    // Save the base32 secret to user
    user.mfaSecret = secret.base32;
    user.mfaEnabled = true;
    await user.save();

    // Generate a QR code data URL that user can scan with Authenticator app
    const otpauth_url = secret.otpauth_url; // This is the URI for the authenticator app
    qrcode.toDataURL(otpauth_url, (err, data_url) => {
      if (err)
        return res.status(500).json({ message: "Error generating QR code" });

      res.json({
        message: "MFA enabled",
        secret: secret.base32,
        qrCode: data_url, // Send the QR code image as data URL
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// MFA Verify Route
app.post("/mfa/verify", async (req, res) => {
  const { username, token } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.mfaSecret) {
      return res.status(400).json({ message: "MFA not setup for this user" });
    }

    // Verify the token using speakeasy
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token: token,
      window: 1, // Allow 1 step before or after to account for clock drift
    });

    if (verified) {
      res.json({ message: "MFA verified, login success" });
    } else {
      res.status(400).json({ message: "Invalid MFA token" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

function authenticateToken(req, res, next) {
  // The token is usually sent in the 'Authorization' header as: Bearer <token>
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token after "Bearer"

  if (!token) return res.status(401).json({ message: "Access token missing" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ message: "Invalid or expired token" });

    // Attach user info from token payload to request object for use in routes
    req.user = user;
    next();
  });
}

// Profile Route
app.get("/profile", authenticateToken, async (req, res) => {
  // You'd normally protect this route and extract user from JWT token
  const { username } = req.query;
  try {
    const user = await User.findOne({ username }).select(
      "-password -mfaSecret"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}.`);
});
