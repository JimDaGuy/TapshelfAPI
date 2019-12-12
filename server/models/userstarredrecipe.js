module.exports = (sequelize, type) => {
  const UserStarredRecipe = sequelize.define('user_starred_recipe', {});

  return UserStarredRecipe;
};
