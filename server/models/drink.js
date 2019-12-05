module.exports = (sequelize, type) => {
  const Drink = sequelize.define('drink', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: type.STRING,
    },
    type: {
      type: type.STRING,
    },
  });

  return Drink;
};
