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
    assert.equal(user.id, expectedUserID);
  });
  it('should return null if searched email does not exist', function() {
    const user = getUserByEmail("notrealperson@example.com", testUsers);
    const expectedUserID = null;
    assert.equal(user, expectedUserID);
  });
});


describe('urlsForUser', function() {
  it('should return URLs associated with the given userID', function() {
    const database = {
      'a': { userID: 'user1', longURL: 'http://example.com' },
      'b': { userID: 'user2', longURL: 'http://example2.com' },
      'c': { userID: 'user1', longURL: 'http://example3.com' }
    };
    const expectedOutput = {
      'a': { userID: 'user1', longURL: 'http://example.com' },
      'c': { userID: 'user1', longURL: 'http://example3.com' }
    };
    const result = urlsForUser('user1', database);
    assert.deepStrictEqual(result, expectedOutput);
  });
  it('should return an empty object if no URLs are associated with the given userID', function() {
    const database = {
      'a': { userID: 'user2', longURL: 'http://example.com' },
      'b': { userID: 'user2', longURL: 'http://example2.com' }
    };
    const result = urlsForUser('user1', database);
    assert.deepStrictEqual(result, {});
  });
  it('should return an empty object if the database is empty', function() {
    const database = {};
    const result = urlsForUser('user1', database);
    assert.deepStrictEqual(result, {});
  });
  it('should handle cases where userID is not a string', function() {
    const database = {
      'a': { userID: '123', longURL: 'http://example.com' },
      'b': { userID: '456', longURL: 'http://example2.com' }
    };
    const result = urlsForUser(123, database);
    assert.deepStrictEqual(result, {});
  });

});