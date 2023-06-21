//jshint esversion:6
require('dotenv').config();
const ShortUrl = require('./models/shortUrl')
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const encrypt = require('mongoose-encryption');
//const md5 = require("md5");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");
const GoogleStrategy = require("passport-google-oauth20").Strategy;


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.use(
    session({
      secret: "Our little secret.",
      resave: false,
      saveUninitialized: false,
    })
  );
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
mongoose.connect('mongodb://localhost/urlShortener', {
  useNewUrlParser: true, useUnifiedTopology: true
})

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String
  });
  //hash and salt our password and to save our users into our mongodb database
  userSchema.plugin(passportLocalMongoose);
  userSchema.plugin(findOrCreate);
  

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
  });
  
passport.deserializeUser(function (id, done) {
User.findById(id)
    .then(function (user) {
    done(null, user);
    })
    .catch(function (err) {
    done(err, null);
    });
});
  

passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/url",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      },
      (accessToken, refreshToken, profile, cb) => {
        console.log(profile);
        User.findOrCreate({ googleId: profile.id }, (err, user) => {
          return cb(err, user);
        });
      }
    )
);
  

app.get("/", function(req, res){
    res.render("home");
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile"] }));

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get(
"/auth/google/url",
passport.authenticate("google", { failureRedirect: "/login" }),
function (req, res) {
    // Successful authentication, redirect to secrets page.
    res.redirect("/url");
}
);
  

app.get("/logout", (req, res) => {
    req.logout(function(err) {
      if (err) {
        console.log(err);
      }
      res.redirect("/");
    });
  });

app.post("/register", (req, res) => {
    User.register({ username: req.body.username }, req.body.password, (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/url");
        });
      }
    });
});
  
app.post("/login", (req, res) => {
const user = new User({
    username: req.body.username,
    password: req.body.password,
});

req.login(user, (err) => {
    if (err) {
    console.log(err);
    } else {
    passport.authenticate("local")(req, res, () => {
        res.redirect("url");
    });
    }
});
});


  app.get('/url', async (req, res) => {
    const shortUrls = await ShortUrl.find()
    res.render('index', { shortUrls: shortUrls })
  })
  
  app.post('/shortUrls', async (req, res) => {
    await ShortUrl.create({ full: req.body.fullUrl })
  
    res.redirect('/')
  })
  
  app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
    if (shortUrl == null) return res.sendStatus(404)
  
    shortUrl.save()
  
    res.redirect(shortUrl.full)
  })
  
const port = 3000;
app.listen(port, () => {
console.log("Server started on port 3000");
});