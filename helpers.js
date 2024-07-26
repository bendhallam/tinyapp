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


module.exports = { getUserByEmail, generateRandomString, urlsForUser }