const helper = require('./helper');
const {
  Recipe, Drink, UserRecipe, UserStarredRecipe, RecipeDrink,
} = require('../sequelize');

const createUserRecipe = async (req, res) => {
  helper.checkToken(req, res, (payload) => {
    const recipeName = `${req.body.name || ''}`;
    const recipeDescription = `${req.body.description || ''}`;

    // Check if recipeName and recipeDescription were sent
    if (!recipeName || !recipeDescription) {
      return res.status(400).json({ error: 'name and description are required' });
    }

    const { userID } = payload;
    let { drinks } = req.body;
    drinks = JSON.parse(drinks);

    // Create recipe
    Recipe.create({ name: recipeName, description: recipeDescription })
      .then((recipe) => {
        const recipeID = recipe.id;

        // Create drinks for each drink item passed in
        drinks.forEach((currDrink) => {
          // Create Drink
          Drink.create(currDrink)
            .then((drink) => {
              const drinkID = drink.id;

              // Add the drink to recipedrinks
              RecipeDrink.create({ recipeID, drinkID });
            });
        });

        // Create UserRecipe entry
        UserRecipe.create({ userID, recipeID })
          .then(() => res.status(200).json({ message: 'Succesfully added recipe to the user' }))
          .catch((err2) => res.status(500).json({ error: `Unable to add recipe to the user. Error: ${err2}` }));
      })
      .catch((err) => res.status(500).json({ error: `Unable to create recipe. Error: ${err}` }));
  });
};

const getUserRecipes = async (req, res) => {
  helper.checkToken(req, res, async (payload) => {
    const { userID } = payload;

    // Grab objects with recipe IDs in them
    const userRecipeIDs = await UserRecipe.findAll({
      where: { userID },
      attributes: ['recipeID'],
      raw: true,
    });

    // Get array of recipeIDs
    const recipeIDs = userRecipeIDs.map((userRecipeID) => userRecipeID.recipeID);

    // Get recipes
    const recipes = Recipe.findAll({
      where: {
        id: recipeIDs,
      },
      raw: true,
    });

    const recipesWithDrinks = recipes.map(async (recipe) => {
      const currentRecipe = recipe;
      const currentRecipeID = currentRecipe.id;

      // Grab drink ID objects for current recipe
      const recipeDrinkIDs = await RecipeDrink.findAll({
        where: {
          recipeID: currentRecipeID,
        },
        attributes: ['drinkID'],
        raw: true,
      });

      // Get array of drinkIDs
      const drinkIDs = recipeDrinkIDs.map((recipeDrinkID) => recipeDrinkID.drinkID);

      // Get array of drinks
      const drinks = await Drink.findAll({
        where: {
          id: drinkIDs,
        },
        raw: true,
      });

      // Add the drinks to the current recipe
      currentRecipe.drinks = drinks;
      return currentRecipe;
    });

    console.dir(recipesWithDrinks);
    const test = recipesWithDrinks;
    console.dir(test);

    return res.status(200).json({ message: 'Successfully retrieved the user\'s recipes.', recipes: test });
  });
};

module.exports = {
  createUserRecipe,
  getUserRecipes,
};
