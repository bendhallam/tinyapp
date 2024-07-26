const bcrypt = require('bcryptjs');
const { SALTROUNDS } = require("./constants");

// Object to store our users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@example.com",
    password: bcrypt.hashSync("aaa", SALTROUNDS),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("bbb", SALTROUNDS),
  },
};

// Object to store our short and long url pairs
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
    visits: 1
  },
  "9sm5xL": {
    longURL: "http://www.google.com",
    userID: "userRandomID",
    visits: 1
  }
};

module.exports = { users, urlDatabase };