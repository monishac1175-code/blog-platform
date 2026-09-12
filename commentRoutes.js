const express = require("express");

const {
    addComment,
    getPostComments,
    editComment,
    removeComment
} = require("../controllers/commentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================
// GET COMMENTS FOR A POST
// GET /api/comments/post/:postId
// ======================================

router.get("/post/:postId", getPostComments);

// ======================================
// ADD COMMENT
// POST /api/comments/post/:postId
// ======================================

router.post(
    "/post/:postId",
    authMiddleware,
    addComment
);

// ======================================
// UPDATE COMMENT
// PUT /api/comments/:id
// ======================================

router.put(
    "/:id",
    authMiddleware,
    editComment
);

// ======================================
// DELETE COMMENT
// DELETE /api/comments/:id
// ======================================

router.delete(
    "/:id",
    authMiddleware,
    removeComment
);

module.exports = router;