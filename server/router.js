const router = (app) => {
  app.get('*', (req, res) => {
    res.send('Hiya!');
  });
};

module.exports = router;
