module.exports = (sequelize, type) => {
  const Recipe = sequelize.define('recipe', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: type.STRING,
    },
    description: {
      type: type.STRING,
    },
  });

  return Recipe;
};
