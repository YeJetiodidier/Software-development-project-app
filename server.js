// ---------------------------
// IMPORT PACKAGES
// ---------------------------
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2"); // mysql2 works with async queries if needed
const app = express();

// ---------------------------
// MIDDLEWARE
// ---------------------------
app.use(express.json()); // allows parsing JSON from React
app.use(
  cors({
    origin: "http://localhost:3002", // React frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// ---------------------------
// DATABASE CONNECTION
// ---------------------------
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // your MySQL password
  database: "week6_db", // your database
});

db.connect((err) => {
  if (err) {
    console.log("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL database");
  }
});

// ---------------------------
// LOGIN ROUTE
// ---------------------------
app.post("/api/auth/login", (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = "SELECT * FROM users WHERE email = ? OR name = ?";

  db.query(sql, [login, login], (err, results) => {
    if (err) {
      console.log("❌ SQL error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = results[0];

    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    return res.json({
      message: "Login successful",
      name: user.name,
      email: user.email,
    });
  });
});

// ---------------------------
// REGISTER ROUTE
// ---------------------------
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if user already exists
  const checkSql = "SELECT * FROM users WHERE email = ? OR name = ?";
  db.query(checkSql, [email, name], (err, results) => {
    if (err) {
      console.log("❌ SQL error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Insert new user
    const insertSql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(insertSql, [name, email, password], (err, result) => {
      if (err) {
        console.log("❌ Register error:", err);
        return res.status(500).json({ message: "Registration failed" });
      }

      res.json({ message: "User registered successfully" });
    });
  });
});

// ---------------------------
// DEFAULT ROUTE
// ---------------------------
app.get("/", (req, res) => {
  res.send("Backend is running correctly!");
});

// ---------------------------
// START SERVER
// ---------------------------
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});