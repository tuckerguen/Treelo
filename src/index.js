//Required Modules
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const expressSession = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const mongoose = require('mongoose');

//Middleware
const secure = require('./middleware/secure');
const auth = require("./middleware/auth");
const tree = require("./middleware/tree");
const app = express();


require('dotenv').config();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//DB Setup
mongoose.connect('mongodb://localhost/treelo', { useNewUrlParser: true});
var db = mongoose.connection;
if(!db)
    console.log("Error connecting db")
else
    console.log("Db connected successfully")

// Setup  port
var port = process.env.PORT || 8080;

//Configure sessions
const session = {
    secret: "J72pYlQ7t#2Hw!n6dAK@n*Ppyn1EM6#2m",
    cookie: {},
    resave: false,
    saveUninitialized: false
};

if(app.get('env') === 'production'){
    session.cookie.secure = true;
}

app.use(expressSession(session));

//Configure Auth0 & Passport
const strategy = new Auth0Strategy(
    {
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      callbackURL:
        process.env.AUTH0_CALLBACK_URL || "http://localhost:8080/callback"
    },
    function(accessToken, refreshToken, extraParams, profile, done) {

      return done(null, profile);
    }
);

passport.use(strategy);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

//Router Mounting
//Default route response
app.get(
    '/',
    (req, res) => {
        res.sendFile('/home.html', {root: 'D:/$Programming/projects/treelo_js/src/views'});
    }
);

app.use('/', auth);
app.use('/trees', tree);

//Make css and js files statically available
app.use(express.static(__dirname + '/views/javascript'));
app.use(express.static(__dirname + '/views/css'));

// Launch app to listen to specified port
app.listen(port, function () {
    console.log("Running Treelo on port " + port);
});

module.exports = app;

