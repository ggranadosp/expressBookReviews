const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    // Verificar si el nombre de usuario y la contrase�a se han proporcionado
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Verificar si el nombre de usuario ya existe
    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists." });
    }

    // Registrar el nuevo usuario
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.status(200).json(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        res.status(200).json(book);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author.toLowerCase();  // Convertir a min�sculas para coincidencia sin distinci�n entre may�sculas y min�sculas
    const matchingBooks = [];

    // Iterar sobre todos los libros
    for (let key in books) {
        if (books[key].author.toLowerCase() === author) {
            matchingBooks.push(books[key]);
        }
    }

    // Verificar si se encontraron libros
    if (matchingBooks.length > 0) {
        res.status(200).json(matchingBooks);
    } else {
        res.status(404).json({ message: "No books found by this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title.toLowerCase();  // Convertir a min�sculas para coincidencia sin distinci�n entre may�sculas y min�sculas
    const matchingBooks = [];

    // Iterar sobre todos los libros
    for (let key in books) {
        if (books[key].title.toLowerCase() === title) {
            matchingBooks.push(books[key]);
        }
    }

    // Verificar si se encontraron libros
    if (matchingBooks.length > 0) {
        res.status(200).json(matchingBooks);
    } else {
        res.status(404).json({ message: "No books found with this title" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    
    if (book) {
        res.status(200).json(book.reviews);
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
