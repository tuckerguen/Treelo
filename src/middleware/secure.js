/**
 * secure.js
 * Used as callback in router method
 * Confirms that a user has access to an endpoint
 * Bypassed if doing automated testing as defined in .env
 */
exports.secured = (req, res, next) => {
    if(!(process.env.TESTING === 'TRUE')) {
        if (req.user) {
            return next();
        }
        req.session.returnTo = req.originalUrl;
        res.redirect("/");
    }
    else { 
        next();
    }
};
