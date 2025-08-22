const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();

let users = [];
const SECRET_KEY = 'I am a secret key';

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

//only registered users can login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  let accessToken = jwt.sign(
    {
      data: username
    },
    SECRET_KEY,
    { expiresIn: '1 Day' }
  );
  req.session.authorization = {
    accessToken, username
  };
  return res.status(200).json({ token: accessToken });
});

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = decoded.data;

    if (!books[isbn]) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }

    books[isbn].reviews[user] = review;
    return res.status(200).json({ message: 'Review added successfully' });
  });
});

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = decoded.data;

    if (!books[isbn]) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (!books[isbn].reviews || !books[isbn].reviews[user]) {
      return res.status(404).json({ message: 'Book not reviewed by user' });
    } else {
      delete books[isbn].reviews[user];
      return res.status(200).json({ message: 'Review deleted successfully' });
    }
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
