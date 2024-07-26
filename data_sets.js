const bcrypt = require('bcryptjs')

// Object to store our users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@example.com",
    password: bcrypt.hashSync("aaa", 10),
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("bbb", 10),
  },
};

// Object to store our short and long url pairs
const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xL": {
    longURL: "http://www.google.com",
    userID: "userRandomID"
  }
};

module.exports = { users, urlDatabase }