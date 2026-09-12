const db = require("../database/database");

// Create a new user
const createUser = (name, email, password, callback) => {
    const sql = `
        INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)
    `;

    db.run(
        sql,
        [name, email, password],
        function (error) {
            if (error) {
                return callback(error);
            }

            callback(null, {
                id: this.lastID,
                name,
                email
            });
        }
    );
};

// Find user by email
const findUserByEmail = (email, callback) => {
    const sql = `
        SELECT *
        FROM users
        WHERE email = ?
    `;

    db.get(sql, [email], (error, user) => {
        if (error) {
            return callback(error);
        }

        callback(null, user);
    });
};

// Find user by ID
const findUserById = (id, callback) => {
    const sql = `
        SELECT id, name, email, created_at
        FROM users
        WHERE id = ?
    `;

    db.get(sql, [id], (error, user) => {
        if (error) {
            return callback(error);
        }

        callback(null, user);
    });
};

// Get all users
const getAllUsers = (callback) => {
    const sql = `
        SELECT id, name, email, created_at
        FROM users
        ORDER BY created_at DESC
    `;

    db.all(sql, [], (error, users) => {
        if (error) {
            return callback(error);
        }

        callback(null, users);
    });
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    getAllUsers
};