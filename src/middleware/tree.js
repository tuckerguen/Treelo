// treeController.js
const express = require('express');
const secure = require('./secure');
const router = express.Router();

router.get(
    '/',
    secure.secured,
    (req, res) => {
        console.log('Received request for tree page');
        res.sendFile('tree.html', {root: 'D:/$Programming/projects/treelo_js/src/views/'});
    }
);

router.get(
    "/user", 
    secure.secured, 
    (req, res, next) => {
        console.log(req.headers);
        //Get user's data
        const { _raw, _json, ...userProfile } = req.user;
        res.render("user", {
            title: "Profile",
            userProfile: userProfile
        });
});

// Import tree model
Tree = require('../models/treeModel');

// Get trees for user
router.get(
    '/data',
    secure.secured,
    async (req, res) => {
        //Get user's data
        const { _raw, _json, ...userProfile } = req.user;

        var emails = userProfile.emails.map((email) => {
            return email.value;
        });

        await Tree.find(
            { 
                ownerId: userProfile.id,
                ownerEmail: { $in : emails }
            }, 
            function(err, trees){
                console.log(trees);
                if (err) {
                    res.json({
                        status: 'error',
                        message: err,
                    });
                }
                else{
                    res.json({
                        status: 'success',
                        message: 'Trees retrieved successfully',
                        data: trees
                    });
                } 
            }
        );
        
    }
);

// Handle create tree actions
router.post(
    '/',
    secure.secured,
    async (req, res) => {
        const { _raw, _json, ...userProfile } = req.user;
        var tree = new Tree();
        tree.title = req.body.title ? req.body.title : tree.title;
        tree.description = req.body.description;
        tree.dueDate = req.body.dueDate;
        tree.ownerId = userProfile.id;
        tree.ownerEmail = userProfile.emails[0];
        //Below for testing
        // tree.ownerId = 'auth0|5dcf7e98bfb28c0ecba5c9f2';
        // tree.ownerEmail = 'test@test.com';
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
    }
);

// Get one tree by id
router.get(
    '/:treeId',
    secure.secured,
    async (req, res) => {
        const { _raw, _json, ...userProfile } = req.user;  
        var emails = userProfile.emails.map((email) => {
            return email.value;
        });

        await Tree.findOne(
            { 
                _id : req.params.treeId,
                ownerId: userProfile.id,
                ownerEmail: { $in : emails }
            },
            function (err, trees) {
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
    }
);

// Handle update tree info
router.put(
    '/:treeId',
    secure.secured,
    (req, res) => {
        Tree.findById(
            req.params.tree_id, 
            function (err, tree) {
            if (err)
                res.send(err);
            tree.title = req.body.title ? req.body.title : tree.title;
            tree.description = req.body.description;
            tree.dueDate = req.body.dueDate;
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
    }
);

// Handle delete tree
router.delete(
    '/:treeId',
    secure.secured,
    (req, res) => {
        const { _raw, _json, ...userProfile } = req.user;
        Tree.remove({
            _id: req.params.tree_id,
            ownerId: userProfile.id,
            ownerEmail: userProfile.emails[0]
        }, function (err, tree) {
            if (err)
                res.send(err);
            res.json({
                status: "success",
                message: 'Tree deleted'
            });
        });
    }
);

// Handle view tree info
// exports.data = async function (req, res) {
//     Tree.findById(req.params.tree_id, function (err, tree) {
//         if (err)
//             res.send(err);
//         res.json({
//             message: 'Tree details loading..',
//             data: tree
//         });
//     });
// };

module.exports = router;