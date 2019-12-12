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
    Recipe.findAll({
      where: {
        id: recipeIDs,
      },
      raw: true,
    }).then((recipes) => {
      const promiseList = [];

      // If I get more errors I may have to set up a promise for each recipe but I dont care right now.

      // Map each recipe to a recipe with its associated drinks
      const recipesWithDrinks = recipes;

      for (let i = 0; i < recipes.length; i += 1) {
        // Create a promise and add it to the promise list
        const currentPromise = new Promise((resolve, reject) => {
          const currentRecipe = recipes[i];
          const currentRecipeID = currentRecipe.id;

          // Grab drink ID objects for current recipe
          RecipeDrink.findAll({
            where: {
              recipeID: currentRecipeID,
            },
            attributes: ['drinkID'],
            raw: true,
          }).then((recipeDrinkIDs) => {
            // Get array of drinkIDs
            const drinkIDs = recipeDrinkIDs.map((recipeDrinkID) => recipeDrinkID.drinkID);

            // Get array of drinks
            Drink.findAll({
              where: {
                id: drinkIDs,
              },
              raw: true,
            }).then((drinks) => {
              // Set drinks of recipes and resolve the promise
              recipesWithDrinks[i].drinks = drinks;
              resolve();
            });
          });
        });

        promiseList.push(currentPromise);
      }

      // Return recipes once
      Promise.all(promiseList).then(() => res.status(200).json({ message: 'Successfully retrieved the user\'s recipes.', recipes: recipesWithDrinks }));
    });
  });
};

module.exports = {
  createUserRecipe,
  getUserRecipes,
};
