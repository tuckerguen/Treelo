// treeController.js
const express = require('express');
const secure = require('./secure');
const router = express.Router();

function getUserProfile(req){
    const testUser = {
        _raw: "",
        _json: "",
        id: 'auth0|5dcf7e98bfb28c0ecba5c9f2',
        emails: [
            {
                value: 'test@test.com'
            }
        ]
    };
    
    try{
        const { _raw, _json, ...userProfile } = (req.user && !process.env.TESTING === 'TRUE') ? req.user : testUser;  
        var emails = userProfile.emails.map((email) => {
            return email.value;
        });
    
        userProfile.emails = emails;
        return userProfile;
    }
    catch(err){
        console.log(err);
        throw "No user defined for request"
    }

}

router.get(
    '/',
    secure.secured,
    (req, res) => {
        console.log('Received request for tree page');
        res.sendFile('tree.html', {root: 'D:/$Programming/projects/treelo_js/src/views/'});
    }
);

// Import tree model
Tree = require('../models/treeModel');

// Get trees for user
router.get(
    '/data',
    secure.secured,
    async (req, res) => {
        //Get user's data
        user = getUserProfile(req);

        await Tree.find(
            { 
                ownerId: user.id,
                ownerEmail: { $in : user.emails }
            }, 
            function(err, trees){
                if (err) {
                    res.status(401);
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
        var user = getUserProfile(req);
        var reqTree = req.body.tree;
        var tree = new Tree();
        //tree.nodeId = req.body.node_id;
        tree.title = reqTree.title;
        tree.description = reqTree.description;
        tree.dueDate = reqTree.dueDate ? reqTree.dueDate : new Date();
        tree.ownerId = user.id;
        tree.ownerEmail = user.emails[0];
        tree.sharedUsers = reqTree.sharedUsers;
        tree.isComplete = reqTree.isComplete;
        tree.isOverdue = reqTree.isOverdue ? reqTree.isOverdue : false;
        tree.children = reqTree.children;
        // save the tree and check for errors
        tree.save(function (err) {
            // Check for validation error
            if (err){
                res.json(err);
                console.log(err);
            }
            else {
                res.json({
                    message: 'New tree created!',
                    data: tree
                });
            }
        });
    }
);

// Get one tree by id
router.get(
    '/:treeId',
    secure.secured,
    async (req, res) => {
        var user = getUserProfile(req);

        await Tree.findOne(    
            { 
                _id : req.params.treeId,
                ownerId: user.id,
                ownerEmail: { $in : user.emails }
            },
            function (err, tree) {
                if (err) {
                    res.json({
                        status: 'error',
                        message: err,
                    });
                }
                else if(tree != null) {
                    res.json({
                        status: 'success',
                        message: 'Tree retrieved successfully',
                        data: tree
                    });
                }
                else {
                    res.json({
                        message: 'No tree with id ' + req.params.treeId + ' found'
                    });
                }
            }
        );
    }
);

// Handle update tree info
router.put(
    '/:treeId',
    secure.secured,
    async (req, res) => {
        var user = getUserProfile(req);
        var reqTree = req.body.tree;

        await Tree.findOne({
            _id : req.params.treeId,
            ownerId : user.id,
            ownerEmail: { $in : user.emails }
        },
        function (err, tree) {
            if (err){
                res.send(err);
            }
            else if(tree != null) {
                tree.title = reqTree.title;
                tree.description = reqTree.description;
                tree.dueDate = reqTree.dueDate;
                tree.ownerEmail = reqTree.ownerEmail;
                tree.ownerId = reqTree.ownerId;
                tree.sharedUsers = reqTree.sharedUsers;
                tree.isComplete = reqTree.isComplete;
                tree.isOverdue = reqTree.isOverdue;
                tree.children = reqTree.children;
                // save the tree and check for errors
                tree.save(function (err) {
                    if (err){
                        console.log(err);
                        res.json(err);
                    }
                    else {
                        console.log("saved");
                        res.json({
                            message: 'Tree Info updated',
                            data: tree
                        });
                    }
                });
            }
            else {
                res.json({
                    message: 'No tree with id ' + req.params.treeId + ' found'
                });
            }
        });
    }
);

// Handle delete tree
router.delete(
    '/:treeId',
    secure.secured,
    (req, res) => {
        var user = getUserProfile(req);
        
        Tree.deleteOne({
            _id: req.params.treeId,
            ownerId: user.id,
            ownerEmail: { $in : user.emails }
        }, 
        function (err, tree) {
            console.log(tree);
            if (err) {
                res.send(err);
            }
            else if(tree != null){
                res.json({
                    status: "success",
                    message: 'Tree deleted'
                });
            }
            else{
                res.json({
                    message: 'No tree with id ' + req.params.treeId + ' found'
                }); 
            }
        });
    }
);

router.get(
    "/user", 
    secure.secured, 
    (req, res, next) => {
        console.log(req.headers);
        //Get user's data
        var user = getUserProfile(req);
        res.render("user", {
            title: "Profile",
            userProfile: user
        });
});

module.exports = router;