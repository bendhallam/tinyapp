const { urlDatabase } = require("./data_sets")

// Find a user object from email
const getUserByEmail = (searchedEmail, database) => {
  for (let key in database) {
    if (database[key].email === searchedEmail) {
      return database[key];
    }
  }
  return null;
};

// Random ID generator
const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};

// Function to filter URLs for specific user
const urlsForUser = (userID, database) => {
  const usersURLs = {};
  for (let id in database) {
    if (database[id]["userID"] === userID) {
      usersURLs[id] = {
        userID,
        longURL: database[id]["longURL"]
      }
    }
  }
  return usersURLs;
};

// Middleware to check if user is logged in
const ensureLoggedIn = (req, res, next) => {
  if (!req.session.user_id) {
    // User is not logged in, send HTML response
    return res.status(401).send(errors.notLoggedIn);
  }
  // User is logged in, proceed to the next middleware or route handler
  next();
};

const ensurePermission = (req, res, next) => {
  const url = urlDatabase[req.params.id];
  if (!url) {
    return res.status(404).send(errors.notFound); // Not found
  }
  if (req.session.user_id !== url.userID) {
    return res.status(401).send(errors.permission); // Permission error
  }
  next();
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser, ensureLoggedIn, ensurePermission }