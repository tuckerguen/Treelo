/**
 * The main server file
 * Handles configuration and setup of the database, security,
 * api router and framework, and static file serving directories
 */

//Express framework module
const express = require('express');
//Modules handling request parsing and paths
const bodyParser = require('body-parser');
const path = require('path');
//Sessions and authorization modules
const expressSession = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
//Object Data Model for MongoDB
const mongoose = require('mongoose');
//Middleware files defining API endpoints
const secure = require('./middleware/secure');
const auth = require("./middleware/auth");
const tree = require("./middleware/tree");

//Main express app
const app = express();


//Configure env file and parsing libraries
require('dotenv').config({path: __dirname + '/.env'});
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

/**
 * Configure and connect to either production or test DB
 * depending on env file values
 */
if(process.env.TESTING === 'TRUE'){
    mongoose.connect('mongodb://localhost/treeloTest', { useNewUrlParser: true});
    var db = mongoose.connection;
    if(!db)
        console.log("Error connecting db")
    else
        console.log("Test Db connected successfully")
}
else {
    mongoose.connect('mongodb://localhost/treelo', { useNewUrlParser: true});
    var db = mongoose.connection;
    if(!db)
        console.log("Error connecting db")
    else
        console.log("Production Db connected successfully")
}


// Setup  port
var port = process.env.PORT || 8080;

// Configure sessions
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


// Configure Auth0 & Passport for authentication
const strategy = new Auth0Strategy(
    {
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      callbackURL:
        process.env.AUTH0_CALLBACK_URL || "http://localhost:8080/callback"
    },
    (accessToken, refreshToken, extraParams, profile, done) => {
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

/**
 * Router mounting
 * Set default route to authorization
 * Set /trees for tree functionality
 */
app.use('/', auth);
app.use('/trees', tree);

/**
 * Define statically available file directories, mainly 
 * javascript, css, and image files
 */
app.use(express.static(__dirname + '/views/javascript'));
app.use(express.static(__dirname + '/views/css'));
app.use(express.static(__dirname + '/views/static'));


// Launch app to listen to specified port
app.listen(port, () => {
    console.log("Running Treelo on port " + port);
});

module.exports = app;