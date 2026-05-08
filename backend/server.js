const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");

require("dotenv").config();

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

// FIX ONLY (Node 22 safe wildcard)
app.options(/.*/, cors());

app.use(express.json());

/* =========================
   EMAIL CONFIG
========================= */

let transporter = null;

if (
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS
) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log("Email Service Ready ✅");
} else {
  console.log("EMAIL_USER or EMAIL_PASS missing ❌");
}

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

app.post("/contact", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({
        success: false,
        message: "MongoDB not connected",
      });
    }

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    const result = await mongoose.connection.db
      .collection("contacts")
      .insertOne({
        name,
        email,
        message,
        important: false,
        replied: false,
        createdAt: new Date(),
      });

    console.log("CONTACT SAVED:", result);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (err) {
    console.log("CONTACT ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

app.delete("/contact", async (req, res) => {
  try {
    const { id } = req.query;

    await mongoose.connection.db
      .collection("contacts")
      .deleteOne({
        _id: new mongoose.Types.ObjectId(id),
      });

    return res.status(200).json({
      success: true,
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

    const contact = await db
      .collection("contacts")
      .findOne({
        _id: new mongoose.Types.ObjectId(id),
      });

    await db.collection("contacts").updateOne(
      {
        _id: new mongoose.Types.ObjectId(id),
      },
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

    await mongoose.connection.db
      .collection("contacts")
      .updateOne(
        {
          _id: new mongoose.Types.ObjectId(id),
        },
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

app.get("/subscribers", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json([]);
    }

    const subscribers =
      await mongoose.connection.db
        .collection("subscribers")
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

    return res.status(200).json(
      Array.isArray(subscribers)
        ? subscribers
        : []
    );
  } catch (err) {
    console.log(
      "SUBSCRIBERS FETCH ERROR:",
      err
    );

    return res.status(200).json([]);
  }
});

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

    const existing = await db
      .collection("subscribers")
      .findOne({ email });

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

    return res.status(200).json({
      success: true,
      message: "Subscribed successfully",
    });
  } catch (err) {
    console.log("SUBSCRIBE ERROR:", err);

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
    "Diwali Template",
    "offer Template",
    "offer1 Template",
  ]);
});

/* =========================
   SEND TEMPLATE
========================= */

app.post("/send-template", async (req, res) => {
  try {
    if (!transporter) {
      return res.status(500).json({
        success: false,
        message: "Email service not configured",
      });
    }

    const { templateName, subscribers } = req.body;

    if (!templateName) {
      return res.status(400).json({
        success: false,
        message: "Template required",
      });
    }

    if (!subscribers || subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No subscribers found",
      });
    }

    let subject = "";
    let html = "";

    if (templateName === "Diwali Template") {
      subject = "Diwali Offers 🎉";
      html = `<div>Welcome</div>`;
    } else if (templateName === "offer Template") {
      subject = "Special Offer ✈️";
      html = `<div>Offer</div>`;
    } else if (templateName === "offer1 Template") {
      subject = "Festival 🎊";
      html = `<div>Festival</div>`;
    }

    for (const user of subscribers) {
      if (!user?.email) continue;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject,
        html,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Template sent successfully",
    });
  } catch (err) {
    console.log("SEND TEMPLATE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* =========================
   REPLY
========================= */

app.post("/reply", async (req, res) => {
  try {
    if (!transporter) {
      return res.status(500).json({
        success: false,
        message: "Email service not configured",
      });
    }

    const { email, message } = req.body;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reply",
      html: `<div>${message}</div>`,
    });

    return res.status(200).json({ success: true });
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
    const subscribers =
      await mongoose.connection.db
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
   404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});