// Helper files
const {
  getUserByEmail,
  generateRandomString,
  ensureLoggedIn,
  ensurePermission,
  setupTemplateVars
} = require("./helpers");
const { users, urlDatabase } = require("./data_sets");
const { PORT, SALTROUNDS, KEY } = require("./constants");
const errors = require("./errors");

// Dependencies
const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs');
const methodOverride = require("method-override")
const app = express();
app.use(cookieSession({
  name: 'session',
  keys: [KEY],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))

// Configure view engine to render templates
app.set("view engine", "ejs");

// Parse incoming requests
app.use(express.urlencoded({ extended: true }));

// GET REQUESTS
// Main page
app.get("/", (req, res) => {
  // If user is logged in, redirect them to the urls index
  if (req.session.user_id) {
    res.redirect("/urls");
  // Otherwise redirect them to the login page
  } else {
    res.redirect("/login");
  }
});

// Login page
app.get("/login", (req, res, next) => {
  // Check if user is already logged in
  if (req.session.user_id) {
    // Redirect to /urls if logged in
    res.redirect("/urls");
  // If not logged in, render the login form
  } else {
    setupTemplateVars(req, res, () => {
      res.render("login", req.templateVars);
    });
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
app.get("/urls/new", ensureLoggedIn, setupTemplateVars, (req, res) => {
  res.render("urls_new", req.templateVars);
});

// URL-specific update page
app.get("/urls/:id", ensureLoggedIn, ensurePermission, setupTemplateVars, (req, res) => {
  // Check if id exists
  if (!urlDatabase[req.params.id]) {
    // Send HTML error message if not
    return res.status(404).send(errors.notFound);
  }
  res.render("urls_show", req.templateVars);
});

// Index of URLs
app.get("/urls", ensureLoggedIn, setupTemplateVars, (req, res) => {
  res.render("urls_index", req.templateVars);
});

// Registration page
app.get("/register", (req, res, next) => {
  // Check if user is already logged in
  if (req.session.user_id) {
    // Redirect to /urls if logged in
    res.redirect("/urls");
  } else {
    // Set up templateVars and render register page
    setupTemplateVars(req, res, () => {
      res.render("register", req.templateVars);
    });
  }
});

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
  let newUserID = generateRandomString();
  // if generated ID already exists, retry
  while (users[newUserID]) {
    newUserID = generateRandomString();
  }
  users[newUserID] = {
    id: newUserID,
    email: email,
    password: bcrypt.hashSync(password, SALTROUNDS)
  };
  // Track new cookie
  req.session.user_id = newUserID;
  res.redirect("/urls");
});

// Submitting a new URL
app.post("/urls", ensureLoggedIn, (req, res) => {
  const newKey = generateRandomString();
  urlDatabase[newKey] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
    visits: 0
  };
  urlDatabase[newKey].visits += 1;
  res.redirect(`/urls/${newKey}`);
});

// Deleting a URL
app.delete("/urls/:id", ensureLoggedIn, ensurePermission, (req, res) => {
  // Delete url from database
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Updating a URL
app.put("/urls/:id", ensureLoggedIn, ensurePermission, (req, res) => {
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
    return res.status(404).send("No account found with this email address.");
  }
  const userID = userLoggingIn.id;
  // Ensure correct password, otherwise return error
  if (!bcrypt.compareSync(password, users[userID]["password"])) {
    return res.status(400).send("Wrong password.");
  }
  // Start tracking cookies
  req.session.user_id = userID;
  res.redirect("/urls");
});

// Handle logout
app.post("/logout", (req, res) => {
  // Clear cookie of user information
  req.session = null;
  res.redirect("/urls");
});

// Run server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
