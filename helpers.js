// Find a user object from email
const getUserByEmail = (searchedEmail, database) => {
  for (let key in database) {
    if (database[key].email === searchedEmail) {
      return database[key]["id"];
    }
  }
  return null;
};

module.exports = { getUserByEmail }