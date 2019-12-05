module.exports = (sequelize, type) => {
  const RecipeDrink = sequelize.define('recipedrink', {
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

  return RecipeDrink;
};
