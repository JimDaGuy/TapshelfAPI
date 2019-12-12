const helper = require('./helper');
const { Drink, UserDrink } = require('../sequelize');

const createUserDrink = async (req, res) => {
  helper.checkToken(req, res, (payload) => {
    const drinkName = `${req.body.drinkName || ''}`;
    const drinkType = `${req.body.drinkType || ''}`;

    // Check if drinkName and drinkType were sent
    if (!drinkName || !drinkType) {
      return res.status(400).json({ error: 'drinkName and drinkType are required' });
    }

    const { userID } = payload;

    Drink.create({ name: drinkName, type: drinkType })
      .then((drink) => {
        const drinkID = drink.id;

        // Create UserDrink entry
        UserDrink.create({ userID, drinkID })
          .then(() => res.status(200).json({ message: 'Succesfully added drink to the user' }))
          .catch((err2) => res.status(500).json({ error: `Unable to add drink to the user. Error: ${err2}` }));
      })
      .catch((err) => res.status(500).json({ error: `Unable to create drink. Error: ${err}` }));
  });
};

const getUserDrinks = async (req, res) => {
  helper.checkToken(req, res, async (payload) => {
    const { userID } = payload;

    // Grab objects with drink IDs in them
    const userDrinkIDs = await UserDrink.findAll({
      where: { userID },
      attributes: ['drinkID'],
      raw: true,
    });

    // Get array of drinkIDs
    const drinkIDs = userDrinkIDs.map((userDrinkID) => userDrinkID.drinkID);

    // Get array of drinks
    const drinks = await Drink.findAll({
      where: {
        id: drinkIDs,
      },
      raw: true,
    });

    return res.status(200).json({ message: 'Succesfully retrieved the user\'s drinks.', drinks });
  });
};

const deleteDrink = async (req, res) => {
  const drinkID = `${req.body.drinkID || ''}`;

  // Check if drinkID was sent
  if (!drinkID) {
    return res.status(400).json({ error: 'drinkID is required' });
  }

  // const { userID } = payload;
  // Will change this method later to verify the drink belongs to the user

  Drink.destroy({
    where: {
      id: drinkID,
    },
  });

  return res.status(200).json({ message: `Succesfully removed drink with ID: ${drinkID}.` });
};

module.exports = {
  createUserDrink,
  getUserDrinks,
  deleteDrink,
};
