"use strict";
console.clear();
const log = console.log;
const PORT = process.env.PORT || 3000;

const express = require("express");
const passport = require("passport");
const session = require("express-session");
// const ObjectID = require("mongodb").ObjectID;
const DATABASE = require("./connection");
// const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");
// const bcrypt = require('bcrypt');
const routes = require('./routes.js');
const auth = require('./auth.js');

require("dotenv").config();

const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);


app.use(express.static(__dirname + '/public'));
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
  
  routes(app, DB)
  auth(app, DB)

  let currentUsers = 0;
  io.on('connection', socket => {
    ++currentUsers
    io.emit('user count', currentUsers)
    console.log('A user has connected')
  })

}).catch((e) => {
  app.route("/").get((req, res) => {
    res.render("index", {
      title: e,
      message: "Unable to login",
    });
  });
});



http.listen(PORT, log(`Server running on port ${PORT}`));
