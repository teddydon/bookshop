const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// Temporary in-memory user store
let users = [];

/**
 * Check if username exists
 */
const isValid = (username) => {
    return users.some(user => user.username === username);
};

/**
 * Authenticate user credentials
 */
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};


// USER LOGIN
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid login credentials" });
    }

    // Create JWT
    const accessToken = jwt.sign(
        { username: username },
        "access",
        { expiresIn: '1h' }
    );

    // Save token in session
    req.session.authorization = {
        accessToken
    };

    return res.status(200).json({ message: "Login successful", token: accessToken });
});


// ADD OR UPDATE A BOOK REVIEW
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;

    if (!review) {
        return res.status(400).json({ message: "Review text is required" });
    }

    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    const username = req.user.username;

    // Add or update review
    book.reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        reviews: book.reviews
    });
});


// DELETE A BOOK REVIEW
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    const username = req.user.username;

    if (!book.reviews[username]) {
        return res.status(404).json({ message: "You have no review for this book" });
    }

    // Remove review
    delete book.reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully",
        reviews: book.reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
