const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Funci�n para verificar si el nombre de usuario es v�lido (no est� ya registrado)
const isValid = (username) => {
    if (!username) {
        return false;
    }
    const userExists = users.some(user => user.username === username);
    return !userExists;
};

// Funci�n para verificar si el usuario est� autenticado
const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username && user.password === password);
    return user !== undefined;
};

// Ruta para registrar un nuevo usuario
regd_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Verificar si el nombre de usuario y la contrase�a se han proporcionado
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Verificar si el nombre de usuario ya existe
    if (!isValid(username)) {
        return res.status(409).json({ message: "Username already exists." });
    }

    // Registrar el nuevo usuario
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully." });
});

// Ruta para el inicio de sesi�n de usuarios registrados
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Verificar si el nombre de usuario y la contrase�a se han proporcionado
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Verificar si el usuario est� autenticado
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password." });
    }

    // Generar un token JWT
    const token = jwt.sign({ username }, "access_secret_key", { expiresIn: '1h' });
    return res.status(200).json({ message: "Login successful", token });
});

// Ruta para agregar una rese�a a un libro
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const username = req.user.username; // Obtener el nombre de usuario del token JWT

    // Verificar si el libro existe
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Buscar si el usuario ya ha publicado una rese�a
    const existingReview = book.reviews.find(r => r.username === username);
    if (existingReview) {
        // Modificar la rese�a existente
        existingReview.review = review;
        return res.status(200).json({ message: "Review updated successfully", reviews: book.reviews });
    } else {
        // Agregar una nueva rese�a
        book.reviews.push({ username, review });
        return res.status(201).json({ message: "Review added successfully", reviews: book.reviews });
    }
});

// Ruta para eliminar una rese�a de un libro
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const username = req.user.username; // Obtener el nombre de usuario del token JWT

    // Verificar si el libro existe
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Filtrar y eliminar la rese�a del usuario
    const reviewIndex = book.reviews.findIndex(r => r.username === username);
    if (reviewIndex !== -1) {
        book.reviews.splice(reviewIndex, 1);
        return res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews });
    } else {
        return res.status(404).json({ message: "Review not found" });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
