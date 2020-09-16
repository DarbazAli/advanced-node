const passport = require("passport");
const bcrypt = require('bcrypt');

module.exports = function( app, DB) {
    app.route("/").get((req, res) => {
        res.render("index", {
          title: "Connected to Database",
          message: "Please login",
          showLogin: true,
          showRegistration: true,
          showSocialAuth: true
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
        .route('/chat')
        .get(ensureAuthenticated, (req, res) => {
          res.render('chat', {user: req.user})
        })
    
        app
        .route('/login')
        .post(
            passport.authenticate('local', {
                failureRedirect: '/'
            }), (req, res) => {
              res.redirect('/profile')
            })

        
        /*======================================================
            GITHUB LOGIN ROUTES
        =======================================================*/
        app.route('/auth/github').get(passport.authenticate('github'));

        app.route('/auth/github/callback').get(passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
          req.session.user_id = req.user.id
          res.redirect('/chat');
        });

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
        8) CREATE AUTHENTICATION MIDDLEWARE
    =======================================================*/
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) return next();
        return res.redirect("/");
    }
}

