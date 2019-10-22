let router = require('express').Router();
router.get('/', function(req, res){
    res.json({
        status: 'API is working with nodemon',
        message: 'Welcome to Treelo!!!'
    });
});
module.exports = router;