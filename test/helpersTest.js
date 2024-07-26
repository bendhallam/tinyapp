const { assert } = require('chai');
const { getUserByEmail, urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });
  it('should return null if searched email does not exist', function() {
    const user = getUserByEmail("notrealperson@example.com", testUsers);
    const expectedUserID = null;
    assert.equal(user, expectedUserID);
  });
});



describe('urlsForUser', function() {
  it('should return an array of urls', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });
  it('should return null if searched email does not exist', function() {
    const user = getUserByEmail("notrealperson@example.com", testUsers);
    const expectedUserID = null;
    assert.equal(user, expectedUserID);
  });
});