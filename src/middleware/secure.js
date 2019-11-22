//Used as callback in router method
//Confirms user has access to endpoint
exports.secured = (req, res, next) => {
  if(!process.env.TESTING == 'TRUE'){
    if (req.user) {
      return next();
    }
    req.session.returnTo = req.originalUrl;
    res.redirect("/");
  }
  else{
    next();
  }
};
