module.exports = (sequelize, type) => {
  const UserRecipe = sequelize.define('user_recipe', {});

  return UserRecipe;
};
