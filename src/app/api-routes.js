// api-routes.js
// Initialize express router
let router = require('express').Router();
// Set default API response
router.get('/', function (req, res) {
    res.json({
        status: 'API Its Working',
        message: 'Welcome to Treelo',
    });
});
// Import tree controller
var treeController = require('../controllers/treeController');
var userController = require('../controllers/userController')
// Tree routes
router.route('/trees')
    .get(treeController.index)
    .post(treeController.new);

router.route('/trees/:tree_id')
    .get(treeController.view)
    .patch(treeController.update)
    .put(treeController.update)
    .delete(treeController.delete);

router.route('/newUser')
    .post(userController.new);

router.route('/login')
    .post(userController.view);

// Export API routes
module.exports = router;