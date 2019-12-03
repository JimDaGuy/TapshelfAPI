const { User } = require('../sequelize');

const createUser = (req, res) => {
  const username = `${req.body.username || ''}`;
  const password = `${req.body.password || ''}`;

  console.dir(username);
  console.dir(password);

  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  return User.create({ username, password }).then((user) => res.json(user));
};

module.exports = {
  createUser,
};
