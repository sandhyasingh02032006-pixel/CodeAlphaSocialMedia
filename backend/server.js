const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

// MySQL Database Connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "codealpha_social_media",
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Home Route
app.get("/", (req, res) => {
    res.send("🎉 CodeAlphaSocialMedia Backend is Running!");
});

// Health Check
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Backend is working!"
    });
});

// Database Connection Check
app.get("/api/db-check", async (req, res) => {
    try {
        const connection = await pool.getConnection();

        await connection.ping();
        connection.release();

        res.json({
            success: true,
            message: "Database connected successfully!"
        });
    } catch (error) {
        console.error("Database error:", error.message);

        res.status(500).json({
            success: false,
            message: "Database connection failed."
        });
    }
});
// Temporary demo API for Home Feed
app.get('/api/stories', (req, res) => {
  res.json({ success: true, stories: [] });
});

app.get('/api/posts', (req, res) => {
  res.json({ success: true, posts: [] });
});

app.get('/stories', (req, res) => {
  res.json({ success: true, stories: [] });
});

app.get('/posts', (req, res) => {
  res.json({ success: true, posts: [] });
});
// Start Server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle Database Pool Errors
pool.on("error", (error) => {
    console.error("MySQL Pool Error:", error.message);
});
