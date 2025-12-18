const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Add a single book
/**public_users.post('/addBook', (req, res) => {
 const { isbn, author, title } = req.body;

 if (!isbn || !author || !title) {
 return res.status(400).json({ message: "ISBN, author, and title are required" });
 }

 books[isbn] = { author, title, reviews: {} };
 return res.status(201).json({ message: "Book added successfully", book: books[isbn] });
 });**/

// Bulk add books
public_users.post('/addBooksBulk', (req, res) => {
    const booksArray = req.body; // Expecting an array

    if (!Array.isArray(booksArray)) {
        return res.status(400).json({ message: "Body must be an array of books" });
    }

    for (let book of booksArray) {
        const { isbn, author, title } = book;
        if (!isbn || !author || !title) {
            return res.status(400).json({ message: "Each book must have isbn, author, and title" });
        }
        books[isbn] = { author, title, reviews: {} };
    }

    return res.status(201).json({ message: `${booksArray.length} books added successfully`, books });
});

public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    // check if user exists
    let userExists = users.some((user) => user.username === username);

    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    // add new user
    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop using Promises
public_users.get('/', function (req, res) {

    const getBooks = new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject("No books available");
        }
    });

    getBooks
        .then((bookList) => {
            res.status(200).send(JSON.stringify(bookList, null, 4));
        })
        .catch((error) => {
            res.status(500).json({ message: error });
        });
});


// Get book details based on ISBN using Promises callbacks
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const getBookByISBN = new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject("Book not found");
        }
    });

    getBookByISBN
        .then((book) => {
            res.status(200).send(JSON.stringify(book, null, 4));
        })
        .catch((error) => {
            res.status(404).json({ message: error });
        });
});


// Get book details based on Author using Promises callbacks
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    const getBooksByAuthor = new Promise((resolve, reject) => {
        let result = {};

        // Iterate through the books object
        for (let isbn in books) {
            if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
                result[isbn] = books[isbn];
            }
        }

        if (Object.keys(result).length > 0) {
            resolve(result);
        } else {
            reject("No books found for this author");
        }
    });

    getBooksByAuthor
        .then((booksByAuthor) => {
            res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
        })
        .catch((error) => {
            res.status(404).json({ message: error });
        });
});


// Get book details based on Title using Promises callbacks
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    const getBooksByTitle = new Promise((resolve, reject) => {
        let result = {};

        // Iterate through the books object
        for (let isbn in books) {
            if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
                result[isbn] = books[isbn];
            }
        }

        if (Object.keys(result).length > 0) {
            resolve(result);
        } else {
            reject("No books found with this title");
        }
    });

    getBooksByTitle
        .then((booksByTitle) => {
            res.status(200).send(JSON.stringify(booksByTitle, null, 4));
        })
        .catch((error) => {
            res.status(404).json({ message: error });
        });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book is not found" });
    }

    return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
