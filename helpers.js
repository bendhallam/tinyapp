const { urlDatabase, users } = require("./data_sets");
const errors = require("./errors");

// Find a user object from email
const getUserByEmail = (searchedEmail, database) => {
  // Iterate through keys of database
  for (let key in database) {
    // Check if current key contains the searched email
    if (database[key].email === searchedEmail) {
      // If so return the key object
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
  // Initialize usersURLs object
  const usersURLs = {};
  for (let id in database) {
    // Check if URL belongs to user
    if (database[id]["userID"] === userID) {
      // Set up usersURL sub-object for that URL
      usersURLs[id] = {
        userID,
        longURL: database[id]["longURL"]
      };
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
  // Proceed to the next middleware/route handler
  next();
};


// Middleware to check if either id exists and/or belongs to current user
const ensurePermission = (req, res, next) => {
  const url = urlDatabase[req.params.id];
  // Check if URL exists
  if (!url) {
    // If not return error html message
    return res.status(404).send(errors.notFound); // Not found
  }
  // Check if correct user
  if (req.session.user_id !== url.userID) {
    // If not return error html message
    return res.status(401).send(errors.permission); // Permission error
  }
  // Proceed to the next middleware/route handler
  next();
};

// Middleware to set up templateVars object
const setupTemplateVars = (req, res, next) => {
  const userId = req.session.user_id;
  // Construct the templateVars object
  req.templateVars = {
    users,
    urls: userId ? urlsForUser(userId, urlDatabase) : undefined,
    id: req.params.id,
    longURL: req.params.id ? urlDatabase[req.params.id] : undefined,
    user: userId
  };
  // Proceed to the next middleware/route handler
  next();
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser, ensureLoggedIn, ensurePermission, setupTemplateVars };