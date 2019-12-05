const controllers = require('./controllers');

const router = (app) => {
  app.post('/signup', controllers.User.createUser);
  app.post('/signin', controllers.User.authenticateUser);
  app.post('/test', controllers.User.test);

  app.get('*', (req, res) => {
    res.send('Hiya!');
  });
};

module.exports = router;
