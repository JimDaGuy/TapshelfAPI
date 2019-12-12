module.exports = (sequelize, type) => {
  const Drink = sequelize.define('drink', {
    name: type.STRING,
    type: type.STRING,
  });

  return Drink;
};
