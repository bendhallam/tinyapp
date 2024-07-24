const express = require("express");
const cookieParser = require("cookie-parser")
const app = express();
app.use(cookieParser())
const PORT = 8080; //default port 8080

//shortened URL string generator
const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};

//find a user object from email
const getUserFromEmail = (searchedEmail) => {
  for (let key in users) {
    if (users[key].email === searchedEmail) {
      return users[key];
    }
  }
  return null;
};



app.set("view engine", "ejs");


//object to store our short and long url pairs
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xL": "http://www.google.com",
};


//object to store our users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  }, 
};

app.use(express.urlencoded({ extended: true }));

// Result of registering
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  // Check if email or password are blank
  if (!email || !password) {
    return res.status(400).send("Email or password cannot be blank.");
  }
  // Check if email is already in use
  if (getUserFromEmail(email) !== null){
    return res.status(400).send("Email already in use.");
  }
  const newUserID = generateRandomString();
  users[newUserID] = {
    id: newUserID,
    email: email,
    password: password
  };
  res.cookie("user_id", newUserID);
  res.redirect("/urls");
});

//result of submitting new URL
app.post("/urls", (req, res) => {
  const newKey = generateRandomString();
  urlDatabase[newKey] = req.body.longURL;
  res.redirect(`/urls/${newKey}`);
});

//result of deleting a URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//result of updating a URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});


// Handle login
app.post("/login", (req, res) => {
  res.cookie("user_id", req.body.username);
  res.redirect("/urls");
});

// Handle logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});


//main page
app.get("/", (req, res) => {
  res.send("Hello!");
});

//login page
app.get("/login", (req, res) => {
  const templateVars = { 
    users,
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: req.cookies["user_id"] 
  };
  res.render("login", templateVars)
})

//redirect to long URL using shortened URL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  res.redirect(urlDatabase[id]);
});

//new URL page
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    users,
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: req.cookies["user_id"] 
  };
  res.render("urls_new", templateVars);
});

//URL-specific update page
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

app.get("/register", (req,res) => {
  const templateVars = { 
    users,
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    user: req.cookies["user_id"] 
  };
  res.render("register", templateVars);
});

//run server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});