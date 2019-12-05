const jwt = require('jsonwebtoken');

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || '';

const checkToken = async (req, res, callback) => {
  // Search for token
  let token = '';

  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    // Authorization: Bearer g1jipjgi1ifjioj
    // Handle token presented as a Bearer token in the Authorization header

    // eslint-disable-next-line prefer-destructuring
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    // Handle token presented as URI param
    token = req.query.token;
  } else if (req.cookies && req.cookies.token) {
    // Handle token presented as a cookie parameter
    token = req.cookies.token;
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(400).send({ error: 'Token invalid or missing.' });
    }

    callback(payload);
  });
};

module.exports = {
  checkToken,
};
