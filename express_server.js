const express = require("express");
const cookieSession = require("cookie-session")
const bcrypt = require('bcryptjs')
const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers")
const { users, urlDatabase } = require("./data_sets")
const errors = require("./errors")
const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ["secret_ingredient"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
const PORT = 8080;




// Configure view engine to render templates
app.set("view engine", "ejs");

// Parse incoming requests
app.use(express.urlencoded({ extended: true }));




// POST REQUESTS
// Registering a new user
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  // Check if email or password are blank
  if (!email || !password) {
    return res.status(400).send("Email or password cannot be blank.");
  }
  // Check if email is already in use
  if (getUserByEmail(email, users) !== null) {
    return res.status(400).send("Email already in use.");
  }
  // Create a new user with a generated ID
  const newUserID = generateRandomString();
  // if generated ID already exists, retry
  while (users[newUserID]) {
    newUserID = generateRandomString()
  };
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
    return res.status(401).send(errors.notLoggedIn);
  }

  // User is logged in, proceed with adding the new URL
  const newKey = generateRandomString();
  urlDatabase[newKey] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${newKey}`);
});

// Deleting a URL
app.post("/urls/:id/delete", (req, res) => {
  // Check if id exists
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send(errors.notFound); // Not found
  }
  // Check if user is logged in
  if (!req.session.user_id) {
    return res.status(401).send(errors.permission); // Permission error
  }
  // Check if URL belongs to user
  if (req.session.user_id !== urlDatabase[req.params.id]["userID"]) {
    return res.status(401).send(errors.permission); // Permission error
  }
  // Delete url from database
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Updating a URL
app.post("/urls/:id", (req, res) => {
  // Check if id exists
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send(errors.notFound); // Not found
  }
  // Check if user is logged in
  if (!req.session.user_id) {
    return res.status(401).send(errors.permission); // Permission error
  }
  // Check if URL belongs to user
  if (req.session.user_id !== urlDatabase[req.params.id]["userID"]) {
    return res.status(401).send(errors.permission); // Permission error
  }
  // Update url in database
  urlDatabase[req.params.id]["longURL"] = req.body.longURL;
  res.redirect("/urls");
});

// Logging in
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  // Get user from provided email if available, otherwise return error
  const userLoggingIn = getUserByEmail(email, users);
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
    return res.status(404).send(errors.notFound);
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
      urls: urlsForUser(req.session.user_id, urlDatabase),
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
    return res.status(401).send(errors.notFound);
  }
  // Check if user is currently logged in
  if (!req.session.user_id) {
    // Send HTML error message if not
    return res.status(401).send(errors.notLoggedIn);
  }
  // Check if URL belongs to current user
  if (req.session.user_id !== urlDatabase[req.params.id]["userID"]) {
    // Send HTML error message if not
    return res.status(401).send(errors.permission);
  }
  const templateVars = {
    users,
    urls: urlsForUser(req.session.user_id, urlDatabase),
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
    return res.status(401).send(errors.notLoggedIn);
  }
  const templateVars = {
    users,
    urls: urlsForUser(req.session.user_id, urlDatabase),
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
      urls: urlsForUser(req.session.user_id, urlDatabase),
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