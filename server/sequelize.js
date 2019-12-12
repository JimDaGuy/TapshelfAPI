const Sequelize = require('sequelize');

// Main models
const UserModel = require('./models/user');
const DrinkModel = require('./models/drink');
const RecipeModel = require('./models/recipe');

// Join table models
const UserDrinkModel = require('./models/userdrink');
const RecipeDrinkModel = require('./models/recipedrink');
const UserRecipeModel = require('./models/userrecipe');
const UserStarredRecipeModel = require('./models/userstarredrecipe');

// Database connection variables
require('dotenv').config();

let sequelize;

const connectionString = process.env.CLEARDB_DATABASE_URL || '';

// Create DB connection
if (!connectionString || connectionString === '') {
  const host = process.env.DB_HOST || 'localhost';
  const dbName = process.env.DB_NAME || 'database';
  const dbUsername = process.env.DB_USERNAME || 'username';
  const dbPassword = process.env.DB_PASSWORD || 'password';

  sequelize = new Sequelize(dbName, dbUsername, dbPassword, {
    host,
    dialect: 'mysql',
  });
} else {
  sequelize = new Sequelize(connectionString);
}

sequelize
  .authenticate()
  .then(() => {
    console.log('Successfully connected to the database');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

// Instantiate main models
const User = UserModel(sequelize, Sequelize);
const Drink = DrinkModel(sequelize, Sequelize);
const Recipe = RecipeModel(sequelize, Sequelize);

// Instantiate join table models
const UserDrink = UserDrinkModel(sequelize, Sequelize);
const RecipeDrink = RecipeDrinkModel(sequelize, Sequelize);
const UserRecipe = UserRecipeModel(sequelize, Sequelize);
const UserStarredRecipe = UserStarredRecipeModel(sequelize, Sequelize);

// Setup join table relationships
User.belongsToMany(Drink, { through: UserDrink, foreignKey: 'userID' });
Drink.belongsToMany(User, { through: UserDrink, foreignKey: 'drinkID' });

Recipe.belongsToMany(Drink, { through: RecipeDrink, foreignKey: 'recipeID' });
Drink.belongsToMany(Recipe, { through: RecipeDrink, foreignKey: 'drinkID' });

User.belongsToMany(Recipe, { through: UserRecipe, foreignKey: 'userID' });
Recipe.belongsToMany(User, { through: UserRecipe, foreignKey: 'recipeID' });

User.belongsToMany(Recipe, { through: UserStarredRecipe, foreignKey: 'userID' });
Recipe.belongsToMany(User, { through: UserStarredRecipe, foreignKey: 'recipeID' });

sequelize.sync({ force: false })
  .then(() => {
    console.log('Database and tables created');
  });

module.exports = {
  User,
  Drink,
  Recipe,
  UserDrink,
  RecipeDrink,
  UserRecipe,
  UserStarredRecipe,
};
