const { Op } = require('sequelize');

const helper = require('./helper');
const {
  Recipe, Drink, UserRecipe, UserStarredRecipe, RecipeDrink,
} = require('../sequelize');

const returnRecipes = (recipeIDs, req, res) => {
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
    Promise.all(promiseList).then(() => res.status(200).json({ message: 'Successfully retrieved the recipes.', recipes: recipesWithDrinks }));
  });
};

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

    returnRecipes(recipeIDs, req, res);
  });
};

const getRecipesByName = async (req, res) => {
  const recipeName = `${req.body.name || ''}`;

  // Check if name was sent
  if (!recipeName) {
    return res.status(400).json({ error: 'name is required' });
  }

  // Grab objects with recipe IDs in them
  const nameRecipeIDs = await Recipe.findAll({
    where: {
      name: {
        // Searches for recipes containing the searched name
        [Op.like]: `%${recipeName}%`,
      },
    },
    attributes: ['id'],
    raw: true,
  });

  // Get array of recipeIDs
  const recipeIDs = nameRecipeIDs.map((nameRecipeID) => nameRecipeID.id);

  returnRecipes(recipeIDs, req, res);
};

const starRecipe = (req, res) => {
  helper.checkToken(req, res, async (payload) => {
    const { userID } = payload;
    const recipeID = `${req.body.recipeID || ''}`;

    // Check if recipeID was sent
    if (!recipeID) {
      return res.status(400).json({ error: 'recipeID is required' });
    }

    // Check if recipe is already starred
    const existingStars = await UserStarredRecipe.findAll({
      where: { userID, recipeID },
    });

    // Star if it doesnt already exist, unstar if not
    if (existingStars.length > 0) {
      UserStarredRecipe.destroy({
        where: { userID, recipeID },
      }).then(() => res.status(200).json({ message: 'Succesfully unstarred the recipe' }))
        .catch((err) => res.status(500).json({ error: `Unable to unstar the recipe. Error: ${err}` }));
    } else {
      UserStarredRecipe.create({ userID, recipeID })
        .then(() => res.status(200).json({ message: 'Succesfully starred the recipe' }))
        .catch((err2) => res.status(500).json({ error: `Unable to star the recipe. Error: ${err2}` }));
    }
  });
};

const getStarredRecipes = async (req, res) => {
  helper.checkToken(req, res, async (payload) => {
    const { userID } = payload;

    // Grab objects with recipeIDs in them of starred recipes
    const starredRecipeIDs = await UserStarredRecipe.findAll({
      where: { userID },
      attributes: ['recipeID'],
      raw: true,
    });

    // Get array of recipeIDs
    const recipeIDs = starredRecipeIDs.map((starredRecipeID) => starredRecipeID.recipeID);

    returnRecipes(recipeIDs, req, res);
  });
};

// Temporary route for checking if a recipe is starred
const checkStarred = async (req, res) => {
  helper.checkToken(req, res, async (payload) => {
    const { userID } = payload;
    const recipeID = `${req.body.recipeID || ''}`;

    // Check if recipeID was sent
    if (!recipeID) {
      return res.status(400).json({ error: 'recipeID is required' });
    }

    // Grab objects with recipeIDs in them of starred recipes
    const starredRecipes = await UserStarredRecipe.findAll({
      where: { userID, recipeID },
      raw: true,
    });

    if (starredRecipes.length > 0) {
      return res.status(200).json({ message: 'true' });
    }

    return res.status(200).json({ message: 'false' });
  });
};

// Temporary route for removing recipes, not even gonna check they belong to the user
const deleteRecipe = async (req, res) => {
  const recipeID = `${req.body.recipeID || ''}`;

  // Check if recipeID was sent
  if (!recipeID) {
    return res.status(400).json({ error: 'recipeID is required' });
  }

  Recipe.destroy({
    where: {
      id: recipeID,
    },
  }).then(() => res.status(200).json({ message: `Successfully removed recipe with ID: ${recipeID}` }));
};

module.exports = {
  checkStarred,
  createUserRecipe,
  deleteRecipe,
  getUserRecipes,
  getRecipesByName,
  getStarredRecipes,
  starRecipe,
};
