// nodeController.js
const express = require('express');
const secure = require('./secure');
const router = express.Router();
const mongoose = require('mongoose');

// Import node model
NodeModel = require('../models/nodeModel');

function getUserProfile(req){
    const testUser = {
        _raw: "",
        _json: "",
        id: 'test|5dcf7e98bfb28c0ecba5c9f2',
        emails: [
            {
                value: 'autotest@test.com'
            }
        ]
    };
    
    try{
        const { _raw, _json, ...userProfile } = (req.user && !(process.env.TESTING === 'TRUE')) ? req.user : testUser;  
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
    '/user', 
    secure.secured, 
    (req, res) => {
        console.log(req);
        //Get user's data
        var user = getUserProfile(req);
        res.json({
            userProfile: user
        });
});

router.get(
    '/',
    secure.secured,
    (req, res) => {
        console.log('Received request for tree page');
        res.sendFile('tree.html', {root: 'D:/$Programming/projects/treelo_js/src/views/'});
    }
);


// Handle create Node actions
router.post(
    '/newTree',
    secure.secured,
    (req, res) => {
        var user = getUserProfile(req);
        var reqNode = req.body.tree;
        console.log('saving tree: ' + reqNode.title);
        var newNode = new NodeModel();  

        newNode.root = true;
        newNode.title = reqNode.title;
        newNode.description = reqNode.description;
        newNode.dueDate = reqNode.dueDate ? reqNode.dueDate : new Date(newNode.dueDate.setMonth(newNode.dueDate.getMonth()+1));
        newNode.ownerId = user.id;
        newNode.ownerEmail = user.emails[0];
        newNode.sharedUsers = reqNode.sharedUsers ? reqNode.sharedUsers : [];
        newNode.isComplete = reqNode.isComplete;
        newNode.isOverdue = reqNode.isOverdue ? reqNode.isOverdue : false;
        newNode.children = [];      

        newNode.save(function (err, savedTree) {
            // Check for validation error
            if (err){
                console.log(err);
                res.status(400);
            }
            else {
                res.status(201).json({
                    message: 'New tree created!',
                    data: savedTree
                });
            }
        });
    }
);

router.post(
    '/addNode/:parentId',
    secure.secured,
    (req, res) => {
        var user = getUserProfile(req);
        var reqNode = req.body.tree;
        var parentId = req.params.parentId.toString();

        console.log('saving new node to: ' + parentId);
        var newNode = new NodeModel();  

        newNode.root = false;
        newNode.title = reqNode.title;
        newNode.description = reqNode.description;
        newNode.dueDate = reqNode.dueDate ? reqNode.dueDate : new Date(newNode.dueDate.setMonth(newNode.dueDate.getMonth()+1));
        newNode.ownerId = user.id;
        newNode.ownerEmail = user.emails[0];
        newNode.sharedUsers = reqNode.sharedUsers;
        newNode.isComplete = reqNode.isComplete;
        newNode.isOverdue = reqNode.isOverdue ? reqNode.isOverdue : false;
        newNode.children = [];      

        newNode.save(function (err, savedNode) {
            // Check for validation error
            if (err){
                console.log(err);
                res.status(400);
            }
            else {
                NodeModel.findByIdAndUpdate(
                    parentId,
                    { $push: {"children": savedNode._id}},
                    {  safe: true, upsert: true},
                    function(err, parent){
                        if(err){
                            console.log(err);
                            res.status(400);
                        }
                        else {
                            res.status(201).json({
                                message: 'New node added!',
                                data: savedNode
                            });
                        }
                    }
                );
            }
        });
    }
)

router.put(
    '/details/:nodeId',
    secure.secured,
    (req, res) => {
        console.log('updating: node with id: ' + req.params.nodeId);
        NodeModel.findByIdAndUpdate(
            req.params.nodeId,
            req.body.node,
            function(err, node){
                if(err){
                    console.log(err);
                    res.status(400).send();
                }
                else {
                    res.status(200).json({
                        message: 'Update successful',
                        data: node
                    });
                }
            }
        )
    }
)

// Get nodes for user
router.get(
    '/data',
    secure.secured,
    (req, res) => {
        //Get user's data
        user = getUserProfile(req);
        console.log('finding trees for: ' + user.emails[0]);
        findTrees(user).then((trees) => {
            if(trees instanceof Error){
                res.status(400).json({
                    status: 'error',
                    message: err,
                });
            }
            else {
                res.status(200).json({
                    status: 'success',
                    message: 'trees retrieved successfully',
                    data: trees
                });
            }
        });
    }
);

// Get one node by id
router.get(
    '/:nodeId',
    secure.secured,
    (req, res) => {
        console.log('finding node with id: ' + req.params.nodeId);
        var user = getUserProfile(req);
        findTree(req.params.nodeId, user).then((tree) => {
            if(tree instanceof Error){
                res.status(400).json({
                    status: 'error',
                    message: err,
                });
            }
            else if(tree != null){
                res.status(200).json({
                    status: 'success',
                    message: 'tree retrieved successfully',
                    data: tree
                });
            }
            else{
                res.status(200).json({
                    status: 'failure',
                    message: 'No tree with id: ' + req.params.nodeId + ' found'
                });
            }
        });
    }
);

function findTree(nodeId, user){
    return NodeModel.findOne({
        _id : nodeId,
        ownerId : user.id,
        ownerEmail: { $in : user.emails }
    })
}

function findTrees(user){
    console.log(user.emails.toString());
    return NodeModel.find({
        $or: [
            {
                root: true,
                ownerId : user.id,
                ownerEmail: { $in : user.emails }
            },
            { 
                sharedUsers: { $in : user.emails }
            }
        ]
    })
}

// Handle delete node
router.delete(
    '/:nodeId',
    secure.secured,
    (req, res) => {
        var user = getUserProfile(req);
        console.log('deleting: ' + req.params.nodeId);
        NodeModel.findOneAndDelete({
            _id: req.params.nodeId,
            ownerId: user.id,
            ownerEmail: { $in : user.emails }
        }, 
        function (err, node) {
            if (err) {
                res.status(400).send(err);
            }
            else if(node.n != 0 && node.deleted != 0){
                res.status(200).json({
                    status: "success",
                    message: 'Node deleted'
                });
            }
            else{
                res.status(400).json({
                    message: 'No Node with id ' + req.params.nodeId + ' found'
                }); 
            }
        });
    }
);

module.exports = router;