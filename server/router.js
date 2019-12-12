const controllers = require('./controllers');

const router = (app) => {
  app.post('/signup', controllers.User.createUser);
  app.post('/signin', controllers.User.authenticateUser);
  // Drinks
  app.post('/addDrink', controllers.Drink.createUserDrink);
  app.get('/getDrinks', controllers.Drink.getUserDrinks);
  app.post('/removeDrink', controllers.Drink.deleteDrink);
  // Recipes
  app.post('/createRecipe', controllers.Recipe.createUserRecipe);
  app.get('/getMyRecipes', controllers.Recipe.getUserRecipes);
  app.get('/getRecipesByName', controllers.Recipe.getRecipesByName);
  app.get('/getStarredRecipes', controllers.Recipe.getStarredRecipes);
  app.get('/checkStarred', controllers.Recipe.checkStarred);
  app.post('/starRecipe', controllers.Recipe.starRecipe);
  app.post('/deleteRecipe', controllers.Recipe.deleteRecipe);

  app.post('/test', controllers.User.test);
  app.get('*', (req, res) => {
    res.send('Hiya!');
  });
};

module.exports = router;
