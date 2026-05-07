const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* =========================
   CORS
========================= */
app.use(
  cors({
    origin: [
      "https://brilliant-intuition-production-07c6.up.railway.app",
      "https://pumpkinpicturesllp.uk",
      "https://www.pumpkinpicturesllp.uk",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

/* =========================
   MONGODB CONNECTION
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log("MongoDB Error:", err);
  });

/* =========================
   HOME ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("Backend Running");
});

/* =========================
   CONTACT ROUTES
========================= */

// GET route for browser testing
app.get("/contact", (req, res) => {
  res.send("Contact route working");
});

// POST route for contact form
app.post("/contact", async (req, res) => {
  try {
    console.log("CONTACT DATA:", req.body);

    const db = mongoose.connection.db;

    await db.collection("contacts").insertOne({
      ...req.body,
      createdAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Contact form submitted successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* =========================
   SUBSCRIBE ROUTES
========================= */

app.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    const db = mongoose.connection.db;

    await db.collection("subscribers").insertOne({
      email,
      createdAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Subscribed successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

app.get("/subscribers", async (req, res) => {
  try {
    const db = mongoose.connection.db;

    const subscribers = await db
      .collection("subscribers")
      .find({})
      .toArray();

    res.status(200).json(subscribers);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* =========================
   LOGIN ROUTE
========================= */

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Simple admin login
    if (username === "admin" && password === "1234") {
      return res.status(200).json({
        success: true,
        token: "admin123",
      });
    }

    // MongoDB user login
    const db = mongoose.connection.db;

    const user = await db
      .collection("users")
      .findOne({ username });

    if (user && user.password === password) {
      return res.status(200).json({
        success: true,
        token: "admin123",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* =========================
   TEMPLATES ROUTE
========================= */

app.get("/templates", (req, res) => {
  res.status(200).json([
    {
      id: 1,
      title: "Template 1",
    },
    {
      id: 2,
      title: "Template 2",
    },
  ]);
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});