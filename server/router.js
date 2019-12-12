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
  app.get('/getRecipes', controllers.Recipe.getUserRecipes);

  app.post('/test', controllers.User.test);
  app.get('*', (req, res) => {
    res.send('Hiya!');
  });
};

module.exports = router;
