//Used as callback in router method
//Confirms user has access to endpoint
exports.secured = (req, res, next) => {
    if (req.user) {
      return next();
    }
    req.session.returnTo = req.originalUrl;
    res.redirect("/");
};
