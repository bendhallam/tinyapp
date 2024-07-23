const express = require("express");
const app = express();
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

app.set("view engine", "ejs");


//object to store our short and long url pairs
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xL": "http://www.google.com",
};

app.use(express.urlencoded({ extended: true }));


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

//handle login
app.post("/login", (req,res) => {
  res.cookie("username", req.body.username)
  res.redirect("/urls")
})

//main page
app.get("/", (req, res) => {
  res.send("Hello!");
});

//redirect to long URL using shortened URL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  res.redirect(urlDatabase[id]);
});

//new URL page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//URL-specific update page
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
  console.log(templateVars);
});

//index of URLs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//run server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});