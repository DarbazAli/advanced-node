const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const ObjectID = require("mongodb").ObjectID;

const log = console.log;

module.exports = function(app, DB) {
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
}