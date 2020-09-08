const epxress = require('express');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();

const app = epxress();

app.listen(3000, () => console.log("Listenting on 3000"))



app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: true,
    saveUninitialized: true,
    maxAge: 3600000
}))
// init passport
app.use(passport.initialize());
app.use(passport.session());


app.set('view engine', 'pug');
app.set('views', 'views');



app.get('/', (req, res, next) => {
    res.render('index', {
        title: 'Advanced Node and Express',
        message: 'Please login'
    })
})