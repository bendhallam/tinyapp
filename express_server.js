const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
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
  return false;
};

// Object to store our users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@example.com",
    password: "aaa",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// Configure view engine to render templates
app.set("view engine", "ejs");

// Parse incoming requests
app.use(express.urlencoded({ extended: true }));


// Object to store our short and long url pairs
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xL": "http://www.google.com",
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
    password: password
  };
  // Track new cookie
  res.cookie("user_id", newUserID);
  res.redirect("/urls");
});

// Submitting a new URL
app.post("/urls", (req, res) => {
  // Check if user is logged in
  if (!req.cookies["user_id"]) {
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
  urlDatabase[newKey] = req.body.longURL;
  res.redirect(`/urls/${newKey}`);
});

// Deleting a URL
app.post("/urls/:id/delete", (req, res) => {
  // Delete url from database
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// Updating a URL
app.post("/urls/:id", (req, res) => {
  // Update url in database
  urlDatabase[req.params.id] = req.body.longURL;
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
  if (password !== users[userID]["password"]) {
    return res.status(403).send("Wrong password.");
  }
  // Start tracking cookies
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

// Handle logout
app.post("/logout", (req, res) => {
  // Clear cookie of user information
  res.clearCookie("user_id");
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
  if (req.cookies["user_id"]) {
    // Redirect to /urls if logged in
    res.redirect("/urls");
  } else {
    const templateVars = {
      users,
      id: req.params.id,
      longURL: urlDatabase[req.params.id],
      user: req.cookies["user_id"]
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
    return res.status(401).send(html);
  }
  // Redirect to long URL
  res.redirect(urlDatabase[id]);
});

// New URL page
app.get("/urls/new", (req, res) => {
  // Check if user is already logged in
  if (!req.cookies["user_id"]) {
    // Redirect to /urls if logged in
    res.redirect("/urls");
  } else {
    const templateVars = {
      users,
      urls: urlDatabase,
      id: req.params.id,
      longURL: urlDatabase[req.params.id],
      user: req.cookies["user_id"]
    };
    res.render("urls_new", templateVars);
  }
});

// URL-specific update page
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    users,
    urls: urlDatabase,
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: req.cookies["user_id"]
  };
  res.render("urls_show", templateVars);
});

// Index of URLs
app.get("/urls", (req, res) => {
  const templateVars = {
    users,
    urls: urlDatabase,
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: req.cookies["user_id"]
  };
  res.render("urls_index", templateVars);
});

// Registration page
app.get("/register", (req, res) => {
  // Check if user is already logged in
  if (req.cookies["user_id"]) {
    // Redirect to /urls if logged in
    res.redirect("/urls");
  } else {
    const templateVars = {
      users,
      urls: urlDatabase,
      id: req.params.id,
      longURL: urlDatabase[req.params.id],
      user: req.cookies["user_id"]
    };
    // Render register page if not logged in
    res.render("register", templateVars);
  }
});

// Run server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});