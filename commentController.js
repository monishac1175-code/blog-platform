const {
    createComment,
    getCommentById,
    getCommentsByPost,
    updateComment,
    deleteComment
} = require("../models/Comment");

const { getPostById } = require("../models/Post");

// ======================================
// ADD COMMENT
// ======================================

const addComment = (req, res) => {
    const postId = req.params.postId;
    const { content } = req.body;

    if (!postId || isNaN(postId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid post ID."
        });
    }

    if (!content || content.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: "Comment cannot be empty."
        });
    }

    if (content.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: "Comment must contain at least 2 characters."
        });
    }

    // Check whether post exists
    getPostById(postId, (postError, post) => {

        if (postError) {
            console.error(postError);

            return res.status(500).json({
                success: false,
                message: "Unable to check post."
            });
        }

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }

        createComment(
            content.trim(),
            postId,
            req.user.id,
            (error, comment) => {

                if (error) {
                    console.error(
                        "Create comment error:",
                        error
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Unable to add comment."
                    });
                }

                return res.status(201).json({
                    success: true,
                    message: "Comment added successfully!",
                    comment
                });
            }
        );
    });
};

// ======================================
// GET COMMENTS FOR POST
// ======================================

const getPostComments = (req, res) => {
    const postId = req.params.postId;

    if (!postId || isNaN(postId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid post ID."
        });
    }

    getCommentsByPost(
        postId,
        (error, comments) => {

            if (error) {
                console.error(
                    "Get comments error:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message: "Unable to load comments."
                });
            }

            return res.status(200).json({
                success: true,
                count: comments.length,
                comments
            });
        }
    );
};

// ======================================
// UPDATE COMMENT
// ======================================

const editComment = (req, res) => {
    const commentId = req.params.id;
    const { content } = req.body;

    if (!commentId || isNaN(commentId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid comment ID."
        });
    }

    if (!content || content.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: "Comment cannot be empty."
        });
    }

    if (content.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: "Comment must contain at least 2 characters."
        });
    }

    // Find comment first
    getCommentById(
        commentId,
        (findError, comment) => {

            if (findError) {
                console.error(findError);

                return res.status(500).json({
                    success: false,
                    message: "Unable to find comment."
                });
            }

            if (!comment) {
                return res.status(404).json({
                    success: false,
                    message: "Comment not found."
                });
            }

            // Ownership check
            if (comment.author_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: "You can only edit your own comments."
                });
            }

            updateComment(
                commentId,
                content.trim(),
                (updateError, updatedComment) => {

                    if (updateError) {
                        console.error(updateError);

                        return res.status(500).json({
                            success: false,
                            message: "Unable to update comment."
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: "Comment updated successfully!",
                        comment: updatedComment
                    });
                }
            );
        }
    );
};

// ======================================
// DELETE COMMENT
// ======================================

const removeComment = (req, res) => {
    const commentId = req.params.id;

    if (!commentId || isNaN(commentId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid comment ID."
        });
    }

    // Find comment first
    getCommentById(
        commentId,
        (findError, comment) => {

            if (findError) {
                console.error(findError);

                return res.status(500).json({
                    success: false,
                    message: "Unable to find comment."
                });
            }

            if (!comment) {
                return res.status(404).json({
                    success: false,
                    message: "Comment not found."
                });
            }

            // Ownership check
            if (comment.author_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: "You can only delete your own comments."
                });
            }

            deleteComment(
                commentId,
                (deleteError, result) => {

                    if (deleteError) {
                        console.error(deleteError);

                        return res.status(500).json({
                            success: false,
                            message: "Unable to delete comment."
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message: "Comment deleted successfully!",
                        result
                    });
                }
            );
        }
    );
};

// ======================================
// EXPORT
// ======================================

module.exports = {
    addComment,
    getPostComments,
    editComment,
    removeComment
};