const express = require('express');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const public_users = express.Router();


public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username or password is required' });
  }

  if (isValid(username)) {
    return res.status(400).json({ message: 'User already exists' });
  } else {
    users.push( { username, password });
    return res.status(201).json({ message: 'User registered successfully' });
  }
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.send(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const foundBook = books[isbn];

  if (!foundBook) {
    return res.status(404).json({ message: 'Book not found' });
  }

  return res.send(foundBook);
});

const getBooksBy = (key, value) => {
  const currentBooks = Object.values(books);
  return currentBooks.filter(book => book[key] === value);
};

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const filteredBooks = getBooksBy('author', author);

  if (!filteredBooks.length) {
    return res.status(404).json({ message: 'No books found for the given author' });
  }
  return res.send(JSON.stringify(filteredBooks));
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const filteredBooks = getBooksBy('title', title);

  if (!filteredBooks.length) {
    return res.status(404).json({ message: 'No books found with the given title' });
  }
  return res.send(JSON.stringify(filteredBooks));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const foundBook = books[isbn];

  if (!foundBook) {
    return res.status(404).json({ message: 'Book not found' });
  }

  if (!foundBook.reviews || Object.keys(foundBook.reviews).length === 0) {
    return res.status(404).json({ message: 'No reviews found for this book' });
  }

  return res.send(JSON.stringify(foundBook.reviews));
});

module.exports.general = public_users;
