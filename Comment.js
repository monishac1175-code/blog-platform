const db = require("../database/database");

// ======================================
// CREATE COMMENT
// ======================================

const createComment = (content, postId, authorId, callback) => {
    const sql = `
        INSERT INTO comments (content, post_id, author_id)
        VALUES (?, ?, ?)
    `;

    db.run(
        sql,
        [content, postId, authorId],
        function (error) {
            if (error) {
                return callback(error);
            }

            getCommentById(this.lastID, callback);
        }
    );
};

// ======================================
// GET COMMENT BY ID
// ======================================

const getCommentById = (id, callback) => {
    const sql = `
        SELECT
            comments.id,
            comments.content,
            comments.post_id,
            comments.author_id,
            comments.created_at,
            users.name AS author_name
        FROM comments
        INNER JOIN users
            ON comments.author_id = users.id
        WHERE comments.id = ?
    `;

    db.get(sql, [id], (error, comment) => {
        if (error) {
            return callback(error);
        }

        callback(null, comment);
    });
};

// ======================================
// GET COMMENTS FOR A POST
// ======================================

const getCommentsByPost = (postId, callback) => {
    const sql = `
        SELECT
            comments.id,
            comments.content,
            comments.post_id,
            comments.author_id,
            comments.created_at,
            users.name AS author_name
        FROM comments
        INNER JOIN users
            ON comments.author_id = users.id
        WHERE comments.post_id = ?
        ORDER BY comments.created_at ASC
    `;

    db.all(sql, [postId], (error, comments) => {
        if (error) {
            return callback(error);
        }

        callback(null, comments);
    });
};

// ======================================
// UPDATE COMMENT
// ======================================

const updateComment = (id, content, callback) => {
    const sql = `
        UPDATE comments
        SET content = ?
        WHERE id = ?
    `;

    db.run(
        sql,
        [content, id],
        function (error) {
            if (error) {
                return callback(error);
            }

            if (this.changes === 0) {
                return callback(null, null);
            }

            getCommentById(id, callback);
        }
    );
};

// ======================================
// DELETE COMMENT
// ======================================

const deleteComment = (id, callback) => {
    const sql = `
        DELETE FROM comments
        WHERE id = ?
    `;

    db.run(sql, [id], function (error) {
        if (error) {
            return callback(error);
        }

        callback(null, {
            deleted: this.changes > 0
        });
    });
};

// ======================================
// DELETE COMMENTS OF A POST
// ======================================

const deleteCommentsByPost = (postId, callback) => {
    const sql = `
        DELETE FROM comments
        WHERE post_id = ?
    `;

    db.run(sql, [postId], function (error) {
        if (error) {
            return callback(error);
        }

        callback(null, {
            deleted: this.changes
        });
    });
};

// ======================================
// EXPORT
// ======================================

module.exports = {
    createComment,
    getCommentById,
    getCommentsByPost,
    updateComment,
    deleteComment,
    deleteCommentsByPost
};