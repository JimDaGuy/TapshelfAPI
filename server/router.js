const controllers = require('./controllers');

const router = (app) => {
  app.post('/signup', controllers.User.createUser);

  app.get('*', (req, res) => {
    res.send('Hiya!');
  });
};

module.exports = router;
