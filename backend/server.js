const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* CORS */
app.use(
  cors({
    origin: [
      "https://brilliant-intuition-production-07c6.up.railway.app",
      "https://pumpkinpicturesllp.uk",
      "https://www.pumpkinpicturesllp.uk",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

/* MongoDB */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

/* HOME */
app.get("/", (req, res) => {
  res.send("Backend Running");
});

/* CONTACT */
app.post("/contact", (req, res) => {
  console.log("CONTACT:", req.body);

  res.status(200).json({
    success: true,
    message: "Contact saved",
  });
});

/* LOGIN */
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "1234") {
    return res.status(200).json({
      success: true,
      token: "admin123",
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid login",
  });
});

/* SUBSCRIBE */
app.post("/subscribe", (req, res) => {
  console.log("SUBSCRIBE:", req.body);

  res.status(200).json({
    success: true,
    message: "Subscribed",
  });
});

/* SUBSCRIBERS */
app.get("/subscribers", (req, res) => {
  res.status(200).json([
    {
      email: "demo@example.com",
    },
  ]);
});

/* TEMPLATES */
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

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});