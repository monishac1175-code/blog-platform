const {
    createPost,
    getAllPosts,
    getPostById,
    getPostsByUser,
    updatePost,
    deletePost,
    searchPosts
} = require("../models/Post");

// ======================================
// CREATE POST
// ======================================

const createNewPost = (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({
            success: false,
            message: "Title and content are required."
        });
    }

    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (cleanTitle.length < 3) {
        return res.status(400).json({
            success: false,
            message: "Title must contain at least 3 characters."
        });
    }

    if (cleanContent.length < 10) {
        return res.status(400).json({
            success: false,
            message: "Post content must contain at least 10 characters."
        });
    }

    createPost(
        cleanTitle,
        cleanContent,
        req.user.id,
        (error, post) => {
            if (error) {
                console.error("Create post error:", error);

                return res.status(500).json({
                    success: false,
                    message: "Unable to create post."
                });
            }

            return res.status(201).json({
                success: true,
                message: "Post published successfully!",
                post
            });
        }
    );
};

// ======================================
// GET ALL POSTS
// ======================================

const getPosts = (req, res) => {
    getAllPosts((error, posts) => {
        if (error) {
            console.error("Get posts error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to load posts."
            });
        }

        return res.status(200).json({
            success: true,
            count: posts.length,
            posts
        });
    });
};

// ======================================
// GET SINGLE POST
// ======================================

const getSinglePost = (req, res) => {
    const postId = req.params.id;

    if (!postId || isNaN(postId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid post ID."
        });
    }

    getPostById(postId, (error, post) => {
        if (error) {
            console.error("Get single post error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to load post."
            });
        }

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }

        return res.status(200).json({
            success: true,
            post
        });
    });
};

// ======================================
// GET CURRENT USER'S POSTS
// ======================================

const getMyPosts = (req, res) => {
    getPostsByUser(req.user.id, (error, posts) => {
        if (error) {
            console.error("Get my posts error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to load your posts."
            });
        }

        return res.status(200).json({
            success: true,
            count: posts.length,
            posts
        });
    });
};

// ======================================
// UPDATE POST
// ======================================

const editPost = (req, res) => {
    const postId = req.params.id;
    const { title, content } = req.body;

    if (!postId || isNaN(postId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid post ID."
        });
    }

    if (!title || !content) {
        return res.status(400).json({
            success: false,
            message: "Title and content are required."
        });
    }

    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (cleanTitle.length < 3) {
        return res.status(400).json({
            success: false,
            message: "Title must contain at least 3 characters."
        });
    }

    if (cleanContent.length < 10) {
        return res.status(400).json({
            success: false,
            message: "Post content must contain at least 10 characters."
        });
    }

    // First check ownership
    getPostById(postId, (findError, post) => {

        if (findError) {
            console.error(findError);

            return res.status(500).json({
                success: false,
                message: "Unable to find post."
            });
        }

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }

        if (post.author_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You can only edit your own posts."
            });
        }

        updatePost(
            postId,
            cleanTitle,
            cleanContent,
            (updateError, updatedPost) => {

                if (updateError) {
                    console.error(updateError);

                    return res.status(500).json({
                        success: false,
                        message: "Unable to update post."
                    });
                }

                return res.status(200).json({
                    success: true,
                    message: "Post updated successfully!",
                    post: updatedPost
                });
            }
        );
    });
};

// ======================================
// DELETE POST
// ======================================

const removePost = (req, res) => {
    const postId = req.params.id;

    if (!postId || isNaN(postId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid post ID."
        });
    }

    // Check ownership first
    getPostById(postId, (findError, post) => {

        if (findError) {
            console.error(findError);

            return res.status(500).json({
                success: false,
                message: "Unable to find post."
            });
        }

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }

        if (post.author_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own posts."
            });
        }

        deletePost(postId, (deleteError, result) => {

            if (deleteError) {
                console.error(deleteError);

                return res.status(500).json({
                    success: false,
                    message: "Unable to delete post."
                });
            }

            return res.status(200).json({
                success: true,
                message: "Post deleted successfully!",
                result
            });
        });
    });
};

// ======================================
// SEARCH POSTS
// ======================================

const searchBlogPosts = (req, res) => {
    const keyword = req.query.q;

    if (!keyword || keyword.trim().length === 0) {
        return res.status(400).json({
            success: false,
            message: "Please enter a search keyword."
        });
    }

    searchPosts(
        keyword.trim(),
        (error, posts) => {

            if (error) {
                console.error("Search error:", error);

                return res.status(500).json({
                    success: false,
                    message: "Unable to search posts."
                });
            }

            return res.status(200).json({
                success: true,
                count: posts.length,
                posts
            });
        }
    );
};

// ======================================
// EXPORT
// ======================================

module.exports = {
    createNewPost,
    getPosts,
    getSinglePost,
    getMyPosts,
    editPost,
    removePost,
    searchBlogPosts
};