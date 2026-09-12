const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Load database
require("./database/database");

// Load routes
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// API ROUTES
// ===============================

app.use("/api/auth", authRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/comments", commentRoutes);

// ===============================
// API TEST
// ===============================

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "BLOGVERSE API is working!"
    });
});

// ===============================
// FRONTEND PAGE ROUTES
// ===============================

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Login page
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Register page
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Dashboard
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// Create post
app.get("/create-post", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "create-post.html"));
});

// Single post
app.get("/post", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "post.html"));
});

// ===============================
// API 404 HANDLER
// ===============================

app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});

// ===============================
// GENERAL ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err);

    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message
    });
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
    console.log("");
    console.log("======================================");
    console.log("       BLOGVERSE SERVER RUNNING       ");
    console.log("======================================");
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Home: http://localhost:${PORT}/`);
    console.log(`Login: http://localhost:${PORT}/login`);
    console.log(`Register: http://localhost:${PORT}/register`);
    console.log(`Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`Create Post: http://localhost:${PORT}/create-post`);
    console.log("======================================");
    console.log("");
});