"use strict";
console.clear();
const log = console.log;
const PORT = process.env.PORT || 3000;

const express = require("express");
const passport = require("passport");
const session = require("express-session");
const ObjectID = require("mongodb").ObjectID;
const DATABASE = require("./connection");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

require("dotenv").config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*======================================================
    3) SETUP PASSPORT & SESSI0N
=======================================================*/
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

/*======================================================
    1) SETUP TEMPLATE ENGINE
=======================================================*/
app.set("view engine", "pug");
app.set("views", "views");

/*======================================================
   5) IMPLEMENTING SERIALIZATION
=======================================================*/
DATABASE(async (client) => {
  const DB = await client.db("test").collection("passport_users");

  app.route("/").get((req, res) => {
    res.render("index", {
      title: "Connected to Database",
      message: "Please login",
      showLogin: true,
      showRegistration: true,
    });
  });

  

  /*======================================================
        7) USE PASSPORT STRATEGY
    =======================================================*/
  app
    .route("/profile")
    .get(ensureAuthenticated, (req, res) =>
      res.render("profile", { username: req.user.username })
    );

    app
    .route('/login')
    .post(
        passport.authenticate('local', {
            failureRedirect: '/'
        }), (req, res) => {
          res.redirect('/profile')
        })

  /*======================================================
        9) LOGOUT USER
    =======================================================*/
  app.route("/logout").get((req, res) => {
    req.logout();
    res.redirect("/");
  });

  /*======================================================
        10) REGISTER NEW USERS
    =======================================================*/
    app
    .route('/register')
    .post( (req, res, next ) => {
      const hash = bcrypt.hashSync(req.body.password, 12);

      DB.findOne({username: req.body.username}, (err, user) => {
        if ( err ) next(err)
        else if ( user ) { res.redirect('/')}
        else {
          DB.insertOne( {
            username: req.body.username,
            password: hash
          }, (err, doc) => {
            if (err) {res.redirect('/')}
            else {
              next(null, doc.ops[0])
            }
          })
        }
      })
    }, 
      passport.authenticate('local', {failureRedirect: '/'}), (req, res, next) => {
        return res.redirect('/profile')
    })

  /*======================================================
        HANDLE MISSING PAGES
    =======================================================*/
  app.use((req, res, next) => {
    res.status(404).type("text").send("Not found!");
  });

  /*======================================================
    4) SERIALIZE USER OBJECT
    =======================================================*/
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    DB.findOne({ _id: new ObjectID(id) }, (err, doc) => {
      done(null, doc);
    });
  });

  /*======================================================
    6) SETUP AUTHENTICATION STRATEGY
    =======================================================*/
  passport.use(
    new LocalStrategy((username, password, done) => {
      DB.findOne({ username: username }, (err, user) => {
        log(`User ${username} attempted to login`);
        if (err) return done(err);
        if (!user) return done(null, false);
        if (!bcrypt.compareSync(password, user.password)) return done(null, false);
        return done(null, user);
      });
    })
  );
}).catch((e) => {
  app.route("/").get((req, res) => {
    res.render("index", {
      title: e,
      message: "Unable to login",
    });
  });
});

/*======================================================
        8) CREATE AUTHENTICATION MIDDLEWARE
=======================================================*/
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.redirect("/");
}

app.listen(PORT, log(`Server running on port ${PORT}`));
