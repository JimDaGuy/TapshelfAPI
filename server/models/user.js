module.exports = (sequelize, type) => {
  const User = sequelize.define('user', {
    username: {
      type: type.STRING,
      unique: true,
    },
    password: type.STRING,
  });

  return User;
};
