/**
 * Required External Modules
 */
const express = require('express');
const router = express.Router();
const passport = require("passport");
const util = require("util");
const url = require("url");
const querystring = require("querystring");

require("dotenv").config();

/**
 * Routes Definitions
 */
const redirect = '/';

router.get(
    '/login', 
    passport.authenticate("auth0", {
        scope: 'openid email profile'
    }), 
    (req, res) => {
        res.redirect(redirect);
    }
);

router.get(
    '/callback',
    (req, res, next) => {
        console.log('callback called');

        passport.authenticate("auth0", (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                console.log('user failed');
                //Redirect to home page if not logged in
                return res.redirect(redirect);
            }
            req.logIn(user, (err) => {
                if (err) {
                    console.log(err);
                    return next(err);
                }
                const returnTo = req.session.returnTo;
                delete req.session.returnTo;
                //Redirect to tree home on login
                console.log('redirect to trees');
                res.redirect(returnTo || '/trees');
            });
        })(req, res, next);
    }
);


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
 * Module Exports
*/
module.exports = router;