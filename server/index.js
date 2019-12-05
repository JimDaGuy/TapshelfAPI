const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const express = require('express');
const session = require('express-session');
const url = require('url');

const RedisStore = require('connect-redis')(session);

const router = require('./router.js');

// Setup environment variables
require('dotenv').config();

const port = process.env.PORT || process.env.NODE_PORT || 8080;

// Redis setup
let redisURL = {
  hostname: 'localhost',
  port: 6379,
};
let redisPass;

if (process.env.REDISCLOUD_URL) {
  redisURL = url.parse(process.env.REDISCLOUD_URL);
  redisPass = redisURL.auth.split(':')[1]; // eslint-disable-line prefer-destructuring
}

// Express app setup
const app = express();

app.use(cors());

app.disable('x-powered-by');
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    key: 'sessionid',
    store: new RedisStore({
      host: redisURL.hostname,
      port: redisURL.port,
      pass: redisPass,
    }),
    secret: process.env.REDIS_SECRET || 'My Custom Redis Secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
    },
  }),
);
app.use(cookieParser());

router(app);

app.listen(port, (err) => {
  if (err) throw err;
  console.log(`Listening on port: ${port}!`);
});
