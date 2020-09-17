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
const passportSocketIo = require('passport.socketio');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');
const URI = process.env.MONGO_URI;
const store = new MongoStore({url: URI})


app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*======================================================
    3) SETUP PASSPORT & SESSI0N
=======================================================*/
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
  key: 'express.sid',
  store: store
}));

app.use(passport.initialize());
app.use(passport.session());

io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'express.sid',
    secret: process.env.SESSION_SECRET,
    store: store,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
  })
)

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
    io.emit('user', {
      name: socket.request.user.name,
      currentUsers,
      connected: true
    })
    console.log(`user ${socket.request.user.username} connected`)

    socket.on('chat message', (message) => {
      io.emit('chat message', { name: socket.request.user.name, message });
    });

    socket.on('disconnect', () => {
      --currentUsers;
      io.emit('user', {
        name: socket.request.user.name,
        currentUsers,
        connected: false
      })
      console.log(`user ${socket.request.user.username} disconnected`)
    })
  })

}).catch((e) => {
  app.route("/").get((req, res) => {
    res.render("index", {
      title: e,
      message: "Unable to login",
    });
  });
});


function onAuthorizeSuccess(data, accept) {
  console.log('successful connection to socket.io')
  accept(null, true)
}

function onAuthorizeFail(data, message, error, accept) {
  if (error) throw new Error(message);
  console.log('failed connection to socket.io: ', message);
  accept(null, false)
}


http.listen(PORT, log(`Server running on port ${PORT}`));
