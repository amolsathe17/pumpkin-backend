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

/* Test Route */
app.get("/", (req, res) => {
  res.send("Backend Running");
});

/* CONTACT ROUTE */
app.post("/contact", (req, res) => {
  console.log(req.body);

  res.status(200).json({
    success: true,
    message: "Contact form received",
  });
});

/* LOGIN ROUTE */
app.post("/login", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Login success",
  });
});

/* SUBSCRIBE ROUTE */
app.post("/subscribe", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Subscribed successfully",
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});