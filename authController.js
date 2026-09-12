const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
    createUser,
    findUserByEmail,
    findUserById
} = require("../models/User");

// ======================================
// CREATE JWT TOKEN
// ======================================

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            name: user.name,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};

// ======================================
// REGISTER USER
// ======================================

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });
        }

        // Validate name
        if (name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Name must contain at least 2 characters."
            });
        }

        // Validate email
        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address."
            });
        }

        // Validate password
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters."
            });
        }

        // Check whether email already exists
        findUserByEmail(
            email.trim().toLowerCase(),
            async (error, existingUser) => {

                if (error) {
                    console.error(error);

                    return res.status(500).json({
                        success: false,
                        message: "Database error."
                    });
                }

                if (existingUser) {
                    return res.status(409).json({
                        success: false,
                        message: "An account with this email already exists."
                    });
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(
                    password,
                    12
                );

                // Create user
                createUser(
                    name.trim(),
                    email.trim().toLowerCase(),
                    hashedPassword,
                    (createError, user) => {

                        if (createError) {
                            console.error(createError);

                            return res.status(500).json({
                                success: false,
                                message: "Unable to create account."
                            });
                        }

                        // Generate token
                        const token = generateToken(user);

                        return res.status(201).json({
                            success: true,
                            message: "Account created successfully!",
                            token,
                            user
                        });
                    }
                );
            }
        );

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong during registration."
        });
    }
};

// ======================================
// LOGIN USER
// ======================================

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        // Find user
        findUserByEmail(
            email.trim().toLowerCase(),
            async (error, user) => {

                if (error) {
                    console.error(error);

                    return res.status(500).json({
                        success: false,
                        message: "Database error."
                    });
                }

                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: "Invalid email or password."
                    });
                }

                // Compare password
                const passwordMatch =
                    await bcrypt.compare(
                        password,
                        user.password
                    );

                if (!passwordMatch) {
                    return res.status(401).json({
                        success: false,
                        message: "Invalid email or password."
                    });
                }

                // Generate token
                const token = generateToken(user);

                // Don't send password to frontend
                const safeUser = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    created_at: user.created_at
                };

                return res.status(200).json({
                    success: true,
                    message: "Login successful!",
                    token,
                    user: safeUser
                });
            }
        );

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong during login."
        });
    }
};

// ======================================
// GET CURRENT USER
// ======================================

const getCurrentUser = (req, res) => {
    findUserById(req.user.id, (error, user) => {

        if (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message: "Database error."
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        return res.status(200).json({
            success: true,
            user
        });
    });
};

// ======================================
// EXPORT
// ======================================

module.exports = {
    register,
    login,
    getCurrentUser
};