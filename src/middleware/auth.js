/**
 *   auth.js
 *   Handles logins, reroutes, and logouts 
 *   through the Auth0 API
 */


//Routing modules
const express = require('express');
const router = express.Router();
//Authentication module
const passport = require("passport");
//URL parsing and reading modules
const util = require("util");
const url = require("url");
const querystring = require("querystring");
//Configure access to .env file
require("dotenv").config();

//Default redirect for unsuccessful logins
const redirect = '/';



/**
 * The default route for the website, a re-route to Auth0 login for Treelo
 */
router.get('/', 
    passport.authenticate("auth0", {
        scope: 'openid email profile'
    }), 
    (req, res) => {
        res.redirect(redirect);
    }
);

/**
 * Callback route used by Auth0 for authentication flow
 */
router.get('/callback',
    (req, res, next) => {
        //Authenticate the user
        passport.authenticate("auth0", (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                console.log('user failed');
                //Redirect to the home login page
                return res.redirect(redirect);
            }
            req.logIn(user, (err) => {
                if (err) {
                    console.log(err);
                    return next(err);
                }
                const returnTo = req.session.returnTo;
                delete req.session.returnTo;
                //Redirect to tree homepage on login
                console.log('redirect to trees');
                res.redirect(returnTo || '/trees');
            });
        })
        (req, res, next);
    }
);

/**
 * Endpoint for logging out a user and terminating their session
 */
router.get(
    '/logout',
    (req, res) => {
        req.logOut();
    
        let returnTo = req.protocol + "://" + req.hostname;
        const port = req.connection.localPort;
    
        if (port !== undefined && port !== 80 && port !== 443) {
        returnTo =
            process.env.NODE_ENV === "production"
            ? `${returnTo}` + redirect
            : `${returnTo}:${port}` + redirect;
        }
    
        const logoutURL = new URL(
            util.format("https://%s/logout", process.env.AUTH0_DOMAIN)
        );
        const searchString = querystring.stringify({
            client_id: process.env.AUTH0_CLIENT_ID,
            returnTo: returnTo
        });

        logoutURL.search = searchString;
        res.redirect(logoutURL);
    }
);

/**
 * Export the router to use in other files
*/
module.exports = router;