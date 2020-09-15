'use strict';
console.clear();
const log = console.log;
const PORT = process.env.PORT || 3000

const express = require('express');
const passport = require('passport');
const session = require('express-session');
const ObjectID = require('mongodb').ObjectID;
const DATABASE = require('./connection');

require('dotenv').config();

const app = express();



/*======================================================
    3) SETUP PASSPORT & SESSI0N
=======================================================*/
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use(passport.initialize());
app.use(passport.session());




/*======================================================
    1) SETUP TEMPLATE ENGINE
=======================================================*/
app.set('view engine', 'pug');
app.set('views', 'views');



/*======================================================
    2) USE TEMPLATE'S POWER
=======================================================*/
app.set('view engine', 'pug');
app.set('views', 'views');



/*======================================================
   5) IMPLEMENTING SERIALIZATION
=======================================================*/
DATABASE( async client => {
    const DB = await client
        .db('database')
        .collection('passport_users');

    app
        .route('/')
        .get((req, res) => {
            res.render('index', {
                title: 'Connected to Database',
                message: 'Please login'
            })
        })


    /*======================================================
    4) SERIALIZE USER OBJECT
    =======================================================*/
    passport.serializeUser((user, done) => {
        done(null, user._id);
    })

    passport.deserializeUser((id, done) => {
        DB.findOne({ _id: new ObjectID(id) }, (err, doc) => {
            done(null, null)
        })
    })

}) .catch( e => {
    app
        .route('/')
        .get((req, res) => {
            res.render('index', {
                title: e, message: 'Unable to login'
            })
        })
})

app.listen(PORT, log(`Server running on port ${PORT}`))