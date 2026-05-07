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
// app.post("/login", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "Login success",
//   });
// });

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

    // MongoDB login (optional)
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
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


app.post("/login", (req, res) => {
  const { email, password } = req.body;

  console.log(email, password);

  if (
    email === "admin@pumpkin.com" &&
    password === "admin123"
  ) {
    return res.status(200).json({
      success: true,
      message: "Login successful",
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid login",
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