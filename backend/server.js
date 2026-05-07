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

// GET CONTACTS
app.get("/contact", async (req, res) => {
  try {
    // Safe Mongo check
    if (!mongoose.connection.db) {
      return res.status(200).json([]);
    }

    const db = mongoose.connection.db;

    const contacts = await db
      .collection("contacts")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(
      Array.isArray(contacts) ? contacts : []
    );
  } catch (err) {
    console.log("CONTACT ERROR:", err);

    // Always send safe array
    res.status(200).json([]);
  }
});

// SAVE CONTACT
app.post("/contact", async (req, res) => {
  try {
    const db = mongoose.connection.db;

    await db.collection("contacts").insertOne({
      ...req.body,
      important: false,
      replied: false,
      createdAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Contact saved",
    });
  } catch (err) {
    console.log("CONTACT SAVE ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// DELETE CONTACT
app.delete("/contact", async (req, res) => {
  try {
    const { id } = req.query;

    const db = mongoose.connection.db;

    await db.collection("contacts").deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    });

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.log("DELETE CONTACT ERROR:", err);

    res.status(500).json({
      success: false,
    });
  }
});

/* =========================
   IMPORTANT CONTACT
========================= */

app.put("/contact-important", async (req, res) => {
  try {
    const { id } = req.query;

    const db = mongoose.connection.db;

    const contact = await db.collection("contacts").findOne({
      _id: new mongoose.Types.ObjectId(id),
    });

    await db.collection("contacts").updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          important: !contact?.important,
        },
      }
    );

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.log("IMPORTANT ERROR:", err);

    res.status(500).json({
      success: false,
    });
  }
});

/* =========================
   MARK REPLIED
========================= */

app.put("/contact-replied", async (req, res) => {
  try {
    const { id } = req.query;

    const db = mongoose.connection.db;

    await db.collection("contacts").updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          replied: true,
        },
      }
    );

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.log("REPLIED ERROR:", err);

    res.status(500).json({
      success: false,
    });
  }
});

/* =========================
   SUBSCRIBE ROUTES
========================= */

// GET SUBSCRIBERS
app.get("/subscribers", async (req, res) => {
  try {
    // Safe Mongo check
    if (!mongoose.connection.db) {
      return res.status(200).json([]);
    }

    const db = mongoose.connection.db;

    const subscribers = await db
      .collection("subscribers")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(
      Array.isArray(subscribers) ? subscribers : []
    );
  } catch (err) {
    console.log("SUBSCRIBERS ERROR:", err);

    // Always send safe array
    res.status(200).json([]);
  }
});

// ADD SUBSCRIBER
app.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    const db = mongoose.connection.db;

    const existing = await db.collection("subscribers").findOne({
      email,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Already subscribed",
      });
    }

    await db.collection("subscribers").insertOne({
      email,
      createdAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Subscribed successfully",
    });
  } catch (err) {
    console.log("SUBSCRIBE ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// DELETE SUBSCRIBER
app.delete("/subscribers", async (req, res) => {
  try {
    const { id } = req.query;

    const db = mongoose.connection.db;

    await db.collection("subscribers").deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    });

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.log("DELETE SUBSCRIBER ERROR:", err);

    res.status(500).json({
      success: false,
    });
  }
});

/* =========================
   LOGIN ROUTE
========================= */

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // SIMPLE LOGIN
    if (username === "admin" && password === "1234") {
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
    console.log("LOGIN ERROR:", err);

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
    "Welcome Template",
    "Offer Template",
    "Festival Template",
  ]);
});

/* =========================
   SEND TEMPLATE
========================= */

app.post("/send-template", async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Template sent successfully",
    });
  } catch (err) {
    console.log("SEND TEMPLATE ERROR:", err);

    res.status(500).json({
      success: false,
    });
  }
});

/* =========================
   REPLY
========================= */

app.post("/reply", async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Reply sent",
    });
  } catch (err) {
    console.log("REPLY ERROR:", err);

    res.status(500).json({
      success: false,
    });
  }
});

/* =========================
   EXPORT
========================= */

app.get("/export", async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Export success",
    });
  } catch (err) {
    console.log("EXPORT ERROR:", err);

    res.status(500).json({
      success: false,
    });
  }
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});