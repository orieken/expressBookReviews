const express = require('express');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const public_users = express.Router();
let axios = require('axios');


public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username or password is required' });
  }

  if (isValid(username)) {
    return res.status(400).json({ message: 'User already exists' });
  } else {
    users.push({ username, password });
    return res.status(201).json({ message: 'User registered successfully' });
  }
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.send(JSON.stringify(books));
});

public_users.get('/books/async', async function (req, res) {
  const url = `http://localhost:8000/`;
  const response = await axios.get(url);
  if (response.status !== 200) {
    return res.status(500).json({ message: 'Error fetching book list' });
  }
  return res.send(JSON.stringify(response.data));
});

public_users.get('/books/promises', function (req, res) {
  const url = `http://localhost:8000/`;
  axios.get(url).then(response => {
    res.send(JSON.stringify(response.data));
  }).catch(error => {
    res.send(500).json({ message: 'Error fetching book lists', error: error });
  });
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

public_users.get('/isbn/async/:isbn', async function (req, res) {
  const isbn = req.params.isbn
  const url = `http://localhost:8000/isbn/${isbn}`;

  const response = await axios.get(url);
  if (response.status !== 200) {
    return res.status(500).json({message: 'Error fetching book details'});
  }
  return res.send(JSON.stringify(response.data));
})

public_users.get('/isbn/promises/:isbn', function (req, res) {
  const isbn = req.params.isbn
  const url = `http://localhost:8000/isbn/${isbn}`;

  axios.get(url).then(response => {
    return res.send(JSON.stringify(response.data));
  }).catch(error => {
    return res.status(500).json({message: 'Error fetching book details', error: error });
  });
})

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

public_users.get('/author/async/:author', async function (req, res) {
  const author = req.params.author
  const url = `http://localhost:8000/author/${author}`;

  const response = await axios.get(url);
  if (response.status !== 200) {
    return res.status(500).json({message: 'Error fetching author details'});
  }
  return res.send(JSON.stringify(response.data));
})

public_users.get('/author/promises/:author', function (req, res) {
  const author = req.params.author
  const url = `http://localhost:8000/author/${author}`;

  axios.get(url).then(response => {
    return res.send(JSON.stringify(response.data));
  }).catch(error => {
    return res.status(500).json({message: 'Error fetching author details', error: error });
  });
})

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const filteredBooks = getBooksBy('title', title);

  if (!filteredBooks.length) {
    return res.status(404).json({ message: 'No books found with the given title' });
  }
  return res.send(JSON.stringify(filteredBooks));
});


public_users.get('/title/async/:title', async function (req, res) {
  const title = req.params.title
  const url = `http://localhost:8000/title/${title}`;

  const response = await axios.get(url);
  if (response.status !== 200) {
    return res.status(500).json({message: 'Error fetching title details'});
  }
  return res.send(JSON.stringify(response.data));
})

public_users.get('/title/promises/:title', function (req, res) {
  const title = req.params.title
  const url = `http://localhost:8000/title/${title}`;

  axios.get(url).then(response => {
    return res.send(JSON.stringify(response.data));
  }).catch(error => {
    return res.status(500).json({message: 'Error fetching title details', error: error });
  });
})

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
