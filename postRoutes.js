const express = require("express");

const {
    createNewPost,
    getPosts,
    getSinglePost,
    getMyPosts,
    editPost,
    removePost,
    searchBlogPosts
} = require("../controllers/postController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================
// GET ALL POSTS
// GET /api/posts
// ======================================

router.get("/", getPosts);

// ======================================
// SEARCH POSTS
// GET /api/posts/search?q=keyword
// ======================================

router.get("/search", searchBlogPosts);

// ======================================
// GET MY POSTS
// GET /api/posts/my
// ======================================

router.get("/my", authMiddleware, getMyPosts);

// ======================================
// GET SINGLE POST
// GET /api/posts/:id
// ======================================

router.get("/:id", getSinglePost);

// ======================================
// CREATE POST
// POST /api/posts
// ======================================

router.post("/", authMiddleware, createNewPost);

// ======================================
// UPDATE POST
// PUT /api/posts/:id
// ======================================

router.put("/:id", authMiddleware, editPost);

// ======================================
// DELETE POST
// DELETE /api/posts/:id
// ======================================

router.delete("/:id", authMiddleware, removePost);

module.exports = router;