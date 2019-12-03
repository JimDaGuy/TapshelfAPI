const Sequelize = require('sequelize');
const UserModel = require('./models/user');

// Database connection variables
require('dotenv').config();

const host = process.env.DB_HOST || 'localhost';
const dbName = process.env.DB_NAME || 'database';
const dbUsername = process.env.DB_USERNAME || 'username';
const dbPassword = process.env.DB_PASSWORD || 'password';

// Create DB connection
const sequelize = new Sequelize(dbName, dbUsername, dbPassword, {
  host,
  dialect: 'mysql',
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Successfully connected to the database');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

const User = UserModel(sequelize, Sequelize);

sequelize.sync({ force: false })
  .then(() => {
    console.log('Database and tables created');
  });

module.exports = {
  User,
};
