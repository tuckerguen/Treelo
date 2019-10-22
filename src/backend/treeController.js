// treeController.js
// Import tree model
Tree = require('./treeModel');
// Handle index actions
exports.index = function (req, res) {
    Tree.get(function (err, trees) {
        if (err) {
            res.json({
                status: "error",
                message: err,
            });
        }
        res.json({
            status: "success",
            message: "Trees retrieved successfully",
            data: trees
        });
    });
};
// Handle create tree actions
exports.new = function (req, res) {
    var tree = new Tree();
    tree.name = req.body.name ? req.body.name : tree.name;
    tree.gender = req.body.gender;
    tree.email = req.body.email;
    tree.phone = req.body.phone;
// save the tree and check for errors
    tree.save(function (err) {
        // Check for validation error
        if (err)
            res.json(err);
        else
            res.json({
                message: 'New tree created!',
                data: tree
            });
    });
};
// Handle view tree info
exports.view = function (req, res) {
    Tree.findById(req.params.tree_id, function (err, tree) {
        if (err)
            res.send(err);
        res.json({
            message: 'Tree details loading..',
            data: tree
        });
    });
};
// Handle update tree info
exports.update = function (req, res) {
    Tree.findById(req.params.tree_id, function (err, tree) {
        if (err)
            res.send(err);
        tree.name = req.body.name ? req.body.name : tree.name;
        tree.gender = req.body.gender;
        tree.email = req.body.email;
        tree.phone = req.body.phone;
// save the tree and check for errors
        tree.save(function (err) {
            if (err)
                res.json(err);
            res.json({
                message: 'Tree Info updated',
                data: tree
            });
        });
    });
};
// Handle delete tree
exports.delete = function (req, res) {
    Tree.remove({
        _id: req.params.tree_id
    }, function (err, tree) {
        if (err)
            res.send(err);
        res.json({
            status: "success",
            message: 'Tree deleted'
        });
    });
};