const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: [
      "https://brilliant-intuition-production-07c6.up.railway.app",
      "https://pumpkinpicturesllp.uk",
      "https://www.pumpkinpicturesllp.uk",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(express.json());

/* =========================
   MONGODB CONNECTION
========================= */

mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "travel",
  })
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.log("MongoDB Connection Error:", err);
  });

/* =========================
   HOME
========================= */

app.get("/", (req, res) => {
  res.send("Backend Running Successfully 🚀");
});

/* =========================
   CONTACT ROUTES
========================= */

// GET CONTACTS
app.get("/contact", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json([]);
    }

    const contacts = await mongoose.connection.db
      .collection("contacts")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json(
      Array.isArray(contacts) ? contacts : []
    );
  } catch (err) {
    console.log("CONTACT FETCH ERROR:", err);

    return res.status(200).json([]);
  }
});

// SAVE CONTACT
app.post("/contact", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: "MongoDB not connected",
      });
    }

    const db = mongoose.connection.db;

    const contactData = {
      name: req.body.name || "",
      email: req.body.email || "",
      message: req.body.message || "",
      important: false,
      replied: false,
      createdAt: new Date(),
    };

    const result = await db
      .collection("contacts")
      .insertOne(contactData);

    console.log("CONTACT SAVED:", result);

    return res.status(200).json({
      success: true,
      message: "Contact saved successfully",
    });
  } catch (err) {
    console.log("CONTACT SAVE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// DELETE CONTACT
app.delete("/contact", async (req, res) => {
  try {
    const { id } = req.query;

    await mongoose.connection.db.collection("contacts").deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    });

    return res.status(200).json({
      success: true,
      message: "Contact deleted",
    });
  } catch (err) {
    console.log("DELETE CONTACT ERROR:", err);

    return res.status(500).json({
      success: false,
    });
  }
});

/* =========================
   CONTACT IMPORTANT
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

    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.log("IMPORTANT ERROR:", err);

    return res.status(500).json({
      success: false,
    });
  }
});

/* =========================
   CONTACT REPLIED
========================= */

app.put("/contact-replied", async (req, res) => {
  try {
    const { id } = req.query;

    await mongoose.connection.db.collection("contacts").updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: {
          replied: true,
        },
      }
    );

    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.log("REPLIED ERROR:", err);

    return res.status(500).json({
      success: false,
    });
  }
});

/* =========================
   SUBSCRIBERS ROUTES
========================= */

// GET SUBSCRIBERS
app.get("/subscribers", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json([]);
    }

    const subscribers = await mongoose.connection.db
      .collection("subscribers")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json(
      Array.isArray(subscribers) ? subscribers : []
    );
  } catch (err) {
    console.log("SUBSCRIBERS FETCH ERROR:", err);

    return res.status(200).json([]);
  }
});

// SAVE SUBSCRIBER
app.post("/subscribe", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: "MongoDB not connected",
      });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

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

    const result = await db.collection("subscribers").insertOne({
      email,
      createdAt: new Date(),
    });

    console.log("SUBSCRIBER SAVED:", result);

    return res.status(200).json({
      success: true,
      message: "Subscribed successfully",
    });
  } catch (err) {
    console.log("SUBSCRIBE SAVE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// DELETE SUBSCRIBER
app.delete("/subscribers", async (req, res) => {
  try {
    const { id } = req.query;

    await mongoose.connection.db.collection("subscribers").deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    });

    return res.status(200).json({
      success: true,
      message: "Subscriber deleted",
    });
  } catch (err) {
    console.log("DELETE SUBSCRIBER ERROR:", err);

    return res.status(500).json({
      success: false,
    });
  }
});

/* =========================
   LOGIN
========================= */

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

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
   TEMPLATES
========================= */

app.get("/templates", (req, res) => {
  return res.status(200).json([
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
    return res.status(200).json({
      success: true,
      message: "Template sent successfully",
    });
  } catch (err) {
    console.log("SEND TEMPLATE ERROR:", err);

    return res.status(500).json({
      success: false,
    });
  }
});

/* =========================
   REPLY
========================= */

app.post("/reply", async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Reply sent successfully",
    });
  } catch (err) {
    console.log("REPLY ERROR:", err);

    return res.status(500).json({
      success: false,
    });
  }
});

/* =========================
   EXPORT
========================= */

app.get("/export", async (req, res) => {
  try {
    const subscribers = await mongoose.connection.db
      .collection("subscribers")
      .find({})
      .toArray();

    return res.status(200).json(subscribers);
  } catch (err) {
    console.log("EXPORT ERROR:", err);

    return res.status(500).json({
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