// nodeController.js
const express = require('express');
const secure = require('./secure');
const router = express.Router();

// Import node model
Node = require('../models/nodeModel');

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


// Handle create Node actions
router.post(
    '/',
    secure.secured,
    (req, res) => {
        var user = getUserProfile(req);
        var reqNode = req.body.tree;
        console.log('saving tree: ' + reqNode.title);
        savedTree = saveRecursive(reqNode, true, user, saveNode);
    
        if(savedTree instanceof Error){
            res.status(400);
        }
        else {
            res.status(201).json({
                message: 'New tree created!',
                data: savedTree
            });
        }
    }
);

function saveNode(newNode){
    newNode.save(function (err) {
        // Check for validation error
        if (err){
            console.log(err);
            return err;
        }
    });
    console.log('saved child w/ id: ' + newNode._id);
    return newNode;
}

function saveRecursive(node, isRoot, user, save){
    console.log('saving children of node: ' + node.title);
    console.log('children: ' + node.children.toString());

    var newNode = new Node();  
    var children = [];

    if(node.children != undefined && node.children.length != 0){
        node.children.forEach(child => {
            console.log('saving children of: ' + child.title);
            children.push(saveRecursive(child, false, user, saveNode));
        });
    }
    else {
        newNode.children = [];
    }

    newNode.root = isRoot;
    newNode.title = node.title;
    newNode.description = node.description;
    newNode.dueDate = node.dueDate ? node.dueDate : new Date(newNode.dueDate.setMonth(newNode.dueDate.getMonth()+1));
    newNode.ownerId = user.id;
    newNode.ownerEmail = user.emails[0];
    newNode.sharedUsers = node.sharedUsers;
    newNode.isComplete = node.isComplete;
    newNode.isOverdue = node.isOverdue ? node.isOverdue : false;
    newNode.children = children;           

    //Save the child, put the id reference into the array of references
    console.log('saving node: ' + node.title);
    finalNode = save(newNode);
    return finalNode;
}

// Get nodes for user
router.get(
    '/data',
    secure.secured,
    (req, res) => {
        //Get user's data
        user = getUserProfile(req);
        console.log('finding trees for: ' + user.id);
        findTrees(user).then((trees) => {
            console.log(trees);
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
        console.log('finding root: ' + req.params.nodeId);
        var user = getUserProfile(req);
        findTree(req.params.nodeId, user).then((tree) => {
            if(tree instanceof Error){
                res.status(400).json({
                    status: 'error',
                    message: err,
                });
            }
            else {
                res.status(200).json({
                    status: 'success',
                    message: 'tree retrieved successfully',
                    data: tree
                });
            }
        });
    }
);

function findTree(nodeId, user){
    return Node.findOne({
        _id : nodeId,
        ownerId : user.id,
        ownerEmail: { $in : user.emails }
    })
}

function findTrees(user){
    return Node.find({
        root: true,
        ownerId : user.id,
        ownerEmail: { $in : user.emails }
    })
}

// Handle update node info
router.put(
    '/:nodeId',
    secure.secured,
    (req, res) => {
        var user = getUserProfile(req);
        var reqNode = req.body.tree;

        Node.findOne({
            _id : req.params.nodeId,
            ownerId : user.id,
            ownerEmail: { $in : user.emails }
        },
        function (err, node) {
            if (err){
                res.status(400).send(err);
            }
            else if(node != null) {
                Node.deleteMany({
                    _id: req.params.nodeId,
                    ownerId: user.id,
                    ownerEmail: { $in : user.emails }
                }).then(() => {
                    node.title = reqNode.title;
                    node.description = reqNode.description;
                    node.dueDate = reqNode.dueDate;
                    node.ownerEmail = reqNode.ownerEmail;
                    node.ownerId = reqNode.ownerId;
                    node.sharedUsers = reqNode.sharedUsers;
                    node.isComplete = reqNode.isComplete;
                    node.isOverdue = reqNode.isOverdue;
                    node.children = reqNode.children;
                    // save the node and check for errors
                    console.log('saving');
                    savedTree = saveRecursive(reqNode, true, user, saveNode);
                    
                    if(savedTree instanceof Error){
                        res.status(400);
                    }
                    else {
                        res.status(201).json({
                            message: 'Tree updated!',
                            data: savedTree
                        });
                    }
                });        
            }
        });
    }
);

// Handle delete node
router.delete(
    '/:nodeId',
    secure.secured,
    (req, res) => {
        var user = getUserProfile(req);
        
        Node.deleteMany({
            _id: req.params.nodeId,
            ownerId: user.id,
            ownerEmail: { $in : user.emails }
        }, 
        function (err, Node) {
            if (err) {
                res.status(400).send(err);
            }
            else if(Node != null){
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

router.get(
    "/user", 
    secure.secured, 
    (req, res, next) => {
        //Get user's data
        var user = getUserProfile(req);
        res.render("user", {
            title: "Profile",
            userProfile: user
        });
});

module.exports = router;