const express = require("express");

const {
    register,
    login,
    getCurrentUser
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================
// REGISTER
// POST /api/auth/register
// ======================================

router.post("/register", register);

// ======================================
// LOGIN
// POST /api/auth/login
// ======================================

router.post("/login", login);

// ======================================
// CURRENT USER
// GET /api/auth/me
// ======================================

router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;