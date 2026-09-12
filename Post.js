const db = require("../database/database");

// ======================================
// CREATE POST
// ======================================

const createPost = (title, content, authorId, callback) => {
    const sql = `
        INSERT INTO posts (title, content, author_id)
        VALUES (?, ?, ?)
    `;

    db.run(
        sql,
        [title, content, authorId],
        function (error) {
            if (error) {
                return callback(error);
            }

            getPostById(this.lastID, callback);
        }
    );
};

// ======================================
// GET ALL POSTS
// ======================================

const getAllPosts = (callback) => {
    const sql = `
        SELECT
            posts.id,
            posts.title,
            posts.content,
            posts.author_id,
            posts.created_at,
            posts.updated_at,
            users.name AS author_name
        FROM posts
        INNER JOIN users
            ON posts.author_id = users.id
        ORDER BY posts.created_at DESC
    `;

    db.all(sql, [], (error, posts) => {
        if (error) {
            return callback(error);
        }

        callback(null, posts);
    });
};

// ======================================
// GET SINGLE POST
// ======================================

const getPostById = (id, callback) => {
    const sql = `
        SELECT
            posts.id,
            posts.title,
            posts.content,
            posts.author_id,
            posts.created_at,
            posts.updated_at,
            users.name AS author_name
        FROM posts
        INNER JOIN users
            ON posts.author_id = users.id
        WHERE posts.id = ?
    `;

    db.get(sql, [id], (error, post) => {
        if (error) {
            return callback(error);
        }

        callback(null, post);
    });
};

// ======================================
// GET POSTS BY USER
// ======================================

const getPostsByUser = (authorId, callback) => {
    const sql = `
        SELECT
            id,
            title,
            content,
            author_id,
            created_at,
            updated_at
        FROM posts
        WHERE author_id = ?
        ORDER BY created_at DESC
    `;

    db.all(sql, [authorId], (error, posts) => {
        if (error) {
            return callback(error);
        }

        callback(null, posts);
    });
};

// ======================================
// UPDATE POST
// ======================================

const updatePost = (id, title, content, callback) => {
    const sql = `
        UPDATE posts
        SET
            title = ?,
            content = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;

    db.run(
        sql,
        [title, content, id],
        function (error) {
            if (error) {
                return callback(error);
            }

            if (this.changes === 0) {
                return callback(null, null);
            }

            getPostById(id, callback);
        }
    );
};

// ======================================
// DELETE POST
// ======================================

const deletePost = (id, callback) => {
    const sql = `
        DELETE FROM posts
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
// SEARCH POSTS
// ======================================

const searchPosts = (keyword, callback) => {
    const sql = `
        SELECT
            posts.id,
            posts.title,
            posts.content,
            posts.author_id,
            posts.created_at,
            posts.updated_at,
            users.name AS author_name
        FROM posts
        INNER JOIN users
            ON posts.author_id = users.id
        WHERE
            posts.title LIKE ?
            OR posts.content LIKE ?
        ORDER BY posts.created_at DESC
    `;

    const searchTerm = `%${keyword}%`;

    db.all(
        sql,
        [searchTerm, searchTerm],
        (error, posts) => {
            if (error) {
                return callback(error);
            }

            callback(null, posts);
        }
    );
};

// ======================================
// EXPORT FUNCTIONS
// ======================================

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    getPostsByUser,
    updatePost,
    deletePost,
    searchPosts
};