module.exports = (sequelize, type) => {
  const Recipe = sequelize.define('recipe', {
    name: type.STRING,
    description: type.STRING,
  });

  return Recipe;
};
