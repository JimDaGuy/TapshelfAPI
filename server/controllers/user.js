const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const helper = require('./helper');
const { User } = require('../sequelize');

// Setup environment variables
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || '';

const createUser = async (req, res) => {
  const username = `${req.body.username || ''}`;
  const password = `${req.body.password || ''}`;

  // Check if username and password were sent
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  // Check if user already exists
  const existingUsers = await User.findAll({
    where: { username },
  });

  if (existingUsers.length > 0) {
    return res.status(400).json({ error: 'Username taken' });
  }

  // Check password length
  // if (password.length < 8) {
  //   return res.status(400).json({ error: 'Password must be atleast 8 characters long' });
  // }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ error: `Internal server error while hashing your password: ${err}` });
    }

    User.create({ username, password: hash })
      .then((user) => {
        const tokenPackage = {
          username: user.username,
          userID: user.id,
        };

        // Create JWT for user
        // Not expiring token for the sake of my assignment deadlines, should probably do it later
        jwt.sign(tokenPackage, JWT_SECRET, { algorithm: 'HS256' }, (err2, token) => {
          if (err2) {
            return res.status(500).json({ error: `The server had problem generating a JWT: ${err2}` });
          }

          return res.status(200).json({ message: `Succesfully created user: ${user.username}`, token });
        });
      })
      .catch((err2) => res.status(500).json({ error: `Unable to create account: ${err2}` }));
  });
};

const authenticateUser = async (req, res) => {
  const username = `${req.body.username || ''}`;
  const password = `${req.body.password || ''}`;

  // Check if username and password were sent
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Grab user and check password
  const user = await User.findOne({
    where: { username },
  });

  if (!user) {
    return res.status(400).json({ error: 'Bad username or password' });
  }

  // Check if user gets found
  console.dir(user);

  const passwordHash = user.password;

  bcrypt.compare(password, passwordHash, (err, success) => {
    if (err) {
      return res.status(500).json({ error: `The server had problem testing your password: ${err}` });
    }

    // Correct password
    if (success) {
      // Generate JWT for user
      const tokenPackage = {
        username: user.username,
        userID: user.id,
      };

      // Not expiring token for the sake of my assignment deadlines, should probably do it later
      jwt.sign(tokenPackage, JWT_SECRET, { algorithm: 'HS256' }, (err2, token) => {
        if (err2) {
          return res.status(500).json({ error: `The server had problem generating a JWT: ${err2}` });
        }

        return res.status(200).json({ message: 'Succesful login.', token });
      });
    } else {
      return res.status(400).json({ error: 'Bad username or password' });
    }
  });
};

const test = async (req, res) => {
  helper.checkToken(req, res, (payload) => {
    console.dir(payload);
    res.status(200).send('Bop');
  });
};

module.exports = {
  createUser,
  authenticateUser,
  test,
};
