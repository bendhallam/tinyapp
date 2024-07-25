const express = require("express");
const cookieSession = require("cookie-session")
const bcrypt = require('bcryptjs')
const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ["secret_ingredient"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
const PORT = 8080;

// Shortened URL string generator
const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};

// Find a user object from email
const getUserFromEmail = (searchedEmail) => {
  for (let key in users) {
    if (users[key].email === searchedEmail) {
      return users[key];
    }
  }
  return null;
};

// Function to filter URLs for specific user
const urlsForUser = (userID) => {
  const usersURLs = {};
  for (let id in urlDatabase) {
    if (urlDatabase[id]["userID"] === userID) {
      usersURLs[id] = {
        "userID": userID,
        "longURL": urlDatabase[id]["longURL"]
      };
    }
  }
  return usersURLs;
};

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


// Configure view engine to render templates
app.set("view engine", "ejs");

// Parse incoming requests
app.use(express.urlencoded({ extended: true }));


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

// POST REQUESTS
// Registering a new user
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  // Check if email or password are blank
  if (!email || !password) {
    return res.status(400).send("Email or password cannot be blank.");
  }
  // Check if email is already in use
  if (getUserFromEmail(email) !== null) {
    return res.status(400).send("Email already in use.");
  }
  // Create a new user with a generated ID
  const newUserID = generateRandomString();
  users[newUserID] = {
    id: newUserID,
    email: email,
    password: bcrypt.hashSync(password, 10)
  };
  // Track new cookie
  req.session.user_id = newUserID;
  res.redirect("/urls");
});

// Submitting a new URL
app.post("/urls", (req, res) => {
  // Check if user is logged in
  if (!req.session.user_id) {
    // User is not logged in, send HTML response
    const html = `
      <html>
        <body>
          <h3>You cannot shorten URLs because you are not logged in.</h3>
          <p>Please <a href="/login">log in</a> or <a href="/register">register</a> to access this feature.</p>
        </body>
      </html>`;
    return res.status(401).send(html);
  }

  // User is logged in, proceed with adding the new URL
  const newKey = generateRandomString();
  urlDatabase[newKey] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${newKey}`);
});

// Deleting a URL
app.post("/urls/:id/delete", (req, res) => {
  // URL doesn't exist HTML
  const notFound = `
      <html>
        <body>
          <h3>URL does not exist.</h3>
          <p>Please either create a <a href="/urls/new">new URL</a> or see <a href="/urls">your URLs</a>.</p>
        </body>
      </html>`;
  // Permission error HTML
  const permissionError = `
      <html>
        <body>
          <h3>You do not have permission to delete this URL.</h3>
          <p>Please either <a href="/login">login</a> or see <a href="/urls">your URLs</a>.</p>
        </body>
      </html>`;
  // Check if id exists
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send(notFound); // Not found
  }
  // Check if user is logged in
  if (!req.session.user_id) {
    return res.status(401).send(permissionError); // Permission error
  }
  // Check if URL belongs to user
  if (req.session.user_id !== urlDatabase[req.params.id]["userID"]) {
    return res.status(401).send(permissionError); // Permission error
  }
  // Delete url from database
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Updating a URL
app.post("/urls/:id", (req, res) => {
  // URL doesn't exist HTML
  const notFound = `
      <html>
        <body>
          <h3>URL does not exist.</h3>
          <p>Please either create a <a href="/urls/new">new URL</a> or see <a href="/urls">your URLs</a>.</p>
        </body>
      </html>`;
  // Permission error HTML
  const permissionError = `
      <html>
        <body>
          <h3>You do not have permission to update this URL.</h3>
          <p>Please either <a href="/login">login</a> or see <a href="/urls">your URLs</a>.</p>
        </body>
      </html>`;
  // Check if id exists
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send(notFound); // Not found
  }
  // Check if user is logged in
  if (!req.session.user_id) {
    return res.status(401).send(permissionError); // Permission error
  }
  // Check if URL belongs to user
  if (req.session.user_id !== urlDatabase[req.params.id]["userID"]) {
    return res.status(401).send(permissionError); // Permission error
  }
  // Update url in database
  urlDatabase[req.params.id]["longURL"] = req.body.longURL;
  res.redirect("/urls");
});

// Logging in
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  // Get user from provided email if available, otherwise return error
  const userLoggingIn = getUserFromEmail(email);
  if (userLoggingIn === null) {
    return res.status(403).send("No account found with this email address.");
  }
  const userID = userLoggingIn.id;
  // Ensure correct password, otherwise return error
  if (!bcrypt.compareSync(password, users[userID]["password"])) {
    return res.status(403).send("Wrong password.");
  }
  // Start tracking cookies
  req.session.user_id = userID;
  res.redirect("/urls");
});

// Handle logout
app.post("/logout", (req, res) => {
  // Clear cookie of user information
  req.session = null
  res.redirect("/urls");
});


// GET REQUESTS
// Main page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Login page
app.get("/login", (req, res) => {
  // Check if user is already logged in
  if (req.session.user_id) {
    // Redirect to /urls if logged in
    res.redirect("/urls");
  } else {
    const templateVars = {
      users,
      id: req.params.id,
      longURL: urlDatabase[req.params.id],
      user: req.session.user_id
    };
    res.render("login", templateVars);
  }
});

// URL redirect
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  // Check if id is in URL database
  if (!urlDatabase[id]) {
    // Send HTML error message if not
    const html = `
      <html>
        <body>
          <h3>Shortened URL id is not in database.</h3>
          <p>Please look at our available <a href="/urls">shortened URLs.</p>
        </body>
      </html>`;
    return res.status(404).send(html);
  }
  // Redirect to long URL
  res.redirect(urlDatabase[id].longURL);
});

// New URL page
app.get("/urls/new", (req, res) => {
  // Check if user is already logged in
  if (!req.session.user_id) {
    // Redirect to /urls if not logged in
    res.redirect("/urls");
  } else {
    const templateVars = {
      users,
      urls: urlsForUser(req.session.user_id),
      id: req.params.id,
      longURL: urlDatabase[req.params.id],
      user: req.session.user_id
    };
    res.render("urls_new", templateVars);
  }
});

// URL-specific update page
app.get("/urls/:id", (req, res) => {
  // Check if id exists
  if (!urlDatabase[req.params.id]) {
    // Send HTML error message if not
    const html = `
      <html>
        <body>
          <h3>URL does not exist.</h3>
          <p>Please either <a href="/urls/new">create new URL</a> or see <a href="/urls">your URLs</a>.</p>
        </body>
      </html>`;
    return res.status(401).send(html);
  }
  // Check if user is currently logged in
  if (!req.session.user_id) {
    // Send HTML error message if not
    const html = `
      <html>
        <body>
          <h3>Only logged in users can see shortened URLs.</h3>
          <p>Please either <a href="/login">login</a> or <a href="/register">register</a> to see shortened URLs.</p>
        </body>
      </html>`;
    return res.status(401).send(html);
  }
  // Check if URL belongs to current user
  if (req.session.user_id !== urlDatabase[req.params.id]["userID"]) {
    // Send HTML error message if not
    const html = `
      <html>
        <body>
          <h3>URL does not belong to current user.</h3>
          <p>See your urls <a href="/urls">here</a>.</p>
        </body>
      </html>`;
    return res.status(401).send(html);
  }
  const templateVars = {
    users,
    urls: urlsForUser(req.session.user_id),
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: req.session.user_id
  };
  res.render("urls_show", templateVars);
});

// Index of URLs
app.get("/urls", (req, res) => {
  // Check if user is logged in
  if (!req.session.user_id) {
    // Send HTML error message if not
    const html = `
      <html>
        <body>
          <h3>Only logged in users can see shortened URLs.</h3>
          <p>Please either <a href="/login">login</a> or <a href="/register">register</a> to see shortened URLs.</p>
        </body>
      </html>`;
    return res.status(401).send(html);
  }
  const templateVars = {
    users,
    urls: urlsForUser(req.session.user_id),
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: req.session.user_id
  };
  res.render("urls_index", templateVars);
});

// Registration page
app.get("/register", (req, res) => {
  // Check if user is already logged in
  if (req.session.user_id) {
    // Redirect to /urls if logged in
    res.redirect("/urls");
  } else {
    const templateVars = {
      users,
      urls: urlsForUser(req.session.user_id),
      id: req.params.id,
      longURL: urlDatabase[req.params.id],
      user: req.session.user_id
    };
    // Render register page if not logged in
    res.render("register", templateVars);
  }
});

// Run server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});