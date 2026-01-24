const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();
require('dotenv').config();

// REGISTER USER
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send({ message: 'All fields are required' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
  db.query(query, [name, email, hashedPassword], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'User registered successfully!' });
  });
});

// LOGIN USER (email OR username)
router.post('/login', (req, res) => {
  const { login, password } = req.body; 
  // login = email OR username

  const query = 'SELECT * FROM users WHERE username = ? OR email = ?';

  db.query(query, [login, login], async (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).send({ message: 'User not found' });

    const user = results[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).send({ message: 'Invalid password' });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.send({ 
      message: 'Login successful', 
      token 
    });
  });
});

module.exports = router;