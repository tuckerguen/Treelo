// treeController.js

exports.view = function(req, res){
    console.log('Received request for tree page');
    res.sendFile('/treeView.html', {root: 'D:/$Programming/projects/treelo_js/src/views/'});
}

// Import tree model
Tree = require('../models/treeModel');

// Get trees for user
exports.getUserTrees = async function(req, res){
    Tree.find(
        { _id: req.params.userId }, 
        { runValidators: true },
        function(err, trees){
            if (err) {
                res.json({
                    status: 'error',
                    message: err,
                });
            }
            res.json({
                status: 'success',
                message: 'Trees retrieved successfully',
                data: trees
            });
        }
    );
}

// Handle index actions
exports.index = async function (req, res) {
    Tree.get(function (err, trees) {
        if (err) {
            res.json({
                status: 'error',
                message: err,
            });
        }
        res.json({
            status: 'success',
            message: 'Trees retrieved successfully',
            data: trees
        });
    });
};

// Handle create tree actions
exports.new = async function (req, res) {
    var tree = new Tree();
    tree.title = req.body.title ? req.body.title : tree.title;
    tree.description = req.body.description;
    tree.dueDate = req.body.dueDate;
    tree.owner = req.body.owner;
    tree.sharedUsers = req.body.sharedUsers;
    tree.isComplete = req.body.isComplete;
    tree.isOverdue = req.body.isOverdue;
    tree.children = req.body.children;
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
exports.data = async function (req, res) {
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
exports.update = async function (req, res) {
    Tree.findById(req.params.tree_id, function (err, tree) {
        if (err)
            res.send(err);
        tree.title = req.body.title ? req.body.title : tree.title;
        tree.description = req.body.description;
        tree.dueDate = req.body.dueDate;
        tree.owner = req.body.owner;
        tree.sharedUsers = req.body.sharedUsers;
        tree.isComplete = req.body.isComplete;
        tree.isOverdue = req.body.isOverdue;
        tree.children = req.body.children;
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
exports.delete = async function (req, res) {
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