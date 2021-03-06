const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
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

    /*======================================================
        GITHUB STRATEGY
    =======================================================*/
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: 'http://127.0.0.1:3000/auth/github/callback'
      },
      function (accessToken, refreshToken, profile, cb) {
        console.log(profile);
        DB.findAndModify(
          { id: profile.id },
          {},
          {
            $setOnInsert: {
              id: profile.id,
              name: profile.displayName || 'John Doe',
              photo: profile.photos[0].value || '',
              email: Array.isArray(profile.emails) ? profile.emails[0].value : 'No public email',
              created_on: new Date(),
              provider: profile.provider || ''
            },
            $set: {
              last_login: new Date()
            },
            $inc: {
              login_count: 1
            }
          },
          { upsert: true, new: true },
          (err, doc) => {
            return cb(null, doc.value);
          }
        );
      }
    ));

}