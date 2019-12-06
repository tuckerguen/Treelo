/**
 * tree.js
 * The primary middleware defining endpoints for all
 * tree and node related actions such as create,
 * retrieve, update, delete, etc
 */

 //Express module
const express = require('express');
//For defining endpoints secured by Auth0
const secure = require('./secure');
//Tree router
const router = express.Router();
//ODM / Schema for MongoDB
const mongoose = require('mongoose');
const NodeModel = require('../models/nodeModel');
//For joining paths
const path = require('path');


/**
 * Retrieves user details (email, id, profile, etc) from a request
 * Returns a default test user during testing
 */
getUserProfile = (req) => {    
    //Profile data for testing
    const testUser = {
        _raw: "", 
        _json: "",
        id: 'test|5dcf7e98bfb28c0ecba5c9f2',
        emails: [{ value: 'autotest@test.com' }]
    };

    try {
        //Extract the user profile from the request
        const { _raw, _json, ...userProfile } = (req.user && !(process.env.TESTING === 'TRUE')) ? req.user : testUser;  
        
        //Map the array of value:email json to just an array of strings
        var emails = userProfile.emails.map((email) => {
            return email.value;
        });
    
        userProfile.emails = emails;
        return userProfile;
    }
    catch(err){
        throw "No user defined for request"
    }
}

/**
 * Endpoint for retrieving a user's profile data
 */
router.get('/user', 
    secure.secured, 
    (req, res) => {
        var user = getUserProfile(req);
        res.json({
            userProfile: user
        });
});

/**
 * Retrieves the main tree html page
 */
router.get('/',
    secure.secured,
    (req, res) => {
        console.log('Received request for tree page');
        res.sendFile('tree.html', {root: path.join(__dirname, "../views")});
    }
);


/**
 * Takes a json defining the root node of a new tree 
 * and stores it in the database
 */
router.post('/newTree',
    secure.secured,
    (req, res) => {
        var user = getUserProfile(req);
        var reqNode = req.body.tree;

        console.log('Request made to save tree: ' + reqNode.title + ' for user: ' + user.emails[0]);

        //Save request as instance of Node Schema
        var newNode = new NodeModel();  
        newNode.root = true;
        newNode.title = reqNode.title;
        newNode.description = reqNode.description;
        newNode.dueDate = reqNode.dueDate;
        newNode.ownerId = user.id;
        newNode.ownerEmail = user.emails[0];
        newNode.sharedUsers = reqNode.sharedUsers ? reqNode.sharedUsers : [];
        newNode.isComplete = reqNode.isComplete;
        newNode.isOverdue = reqNode.isOverdue ? reqNode.isOverdue : false;
        newNode.children = [];      

        newNode.save((err, savedTree) => {
            if (err){
                console.log(err);
                res.status(400);
            }
            else {
                console.log('Saved tree: ' + reqNode.title + ' for user: ' + user.emails[0]);
                res.status(201).json({
                    message: 'New tree created',
                    data: savedTree
                });
            }
        });
    }
);

/**
 * Takes json of node as input and saves it as a child
 * of the parent with the id given in the path parameter
 */
router.post('/addNode/:parentId',
    secure.secured,
    (req, res) => {
        var user = getUserProfile(req);
        var reqNode = req.body.tree;
        var parentId = req.params.parentId.toString();

        console.log('Saving node: ' + reqNode.title + ' to parent: ' + parentId + ' for user: ' + user.emails[0]);
        
        //Save request as instance of Node Schema
        var newNode = new NodeModel();  
        newNode.root = false;
        newNode.title = reqNode.title;
        newNode.description = reqNode.description;
        newNode.dueDate = reqNode.dueDate 
        newNode.ownerId = user.id;
        newNode.ownerEmail = user.emails[0];
        newNode.sharedUsers = reqNode.sharedUsers;
        newNode.isComplete = reqNode.isComplete;
        newNode.isOverdue = reqNode.isOverdue ? reqNode.isOverdue : false;
        newNode.children = [];      

        // Save the node to the database
        newNode.save((err, savedNode) => {
            if (err){
                console.log(err);
                res.status(400);
            }
            else {
                // Find the parent and add the new node's
                // id to the parent's list of children
                var query = { $push: {"children": savedNode._id}};
                var options = {  safe: true, upsert: true};

                NodeModel.findByIdAndUpdate(
                    parentId, 
                    query, 
                    options, 
                    (err, parent) => {
                        if(err){
                            console.log(err);
                            res.status(400);
                        }
                        else {
                            console.log('Saved node: ' + reqNode.title + ' to parent: ' + parentId + ' for user: ' + user.emails[0])
                            res.status(201).json({
                                message: 'New node added',
                                data: savedNode
                            });
                        }
                    }
                );
            }
        });
    }
)

/**
 * Takes json of a node and updates the node with id given
 * in the path parameter with the data from the request
 */
router.put('/details/:nodeId',
    secure.secured,
    (req, res) => {
        console.log('Updating node: ' + req.params.nodeId);

        // Ensure that if shared users is empty, mongoose updates
        // the database accordingly
        if(!req.body.node.hasOwnProperty("sharedUsers")){
            req.body.node.sharedUsers = undefined;
        }

        // Find the node and update
        NodeModel.findByIdAndUpdate (
            req.params.nodeId,
            req.body.node,
            (err, node) => {
                if(err) {
                    console.log(err);
                    res.status(400).send();
                }
                else {
                    console.log('Updated node: ' + req.params.nodeId);
                    res.status(200).json({
                        message: 'Update successful',
                        data: node
                    });
                }
            }
        )
    }
)

/**
 * Retrieves all trees owned by and shared with the 
 * user that is logged in for this session
 */
router.get('/data',
    secure.secured,
    (req, res) => {
        var user = getUserProfile(req);

        console.log('Finding all trees for user: ' + user.emails[0]);

        //Find nodes where this user is the owner or is shared on the node
        NodeModel.find({
            $or: [
                { root: true, ownerId : user.id, ownerEmail: { $in : user.emails } },
                { sharedUsers: { $in : user.emails } }
            ]}, 
            (err, trees) => {
                if(err) {
                    console.log(err);
                    res.status(400).json({
                        status: 'error',
                        message: err,
                    });
                }
                else {
                    console.log('Trees for user: ' + user.emails[0] + ' retrieved');
                    res.status(200).json({
                        status: 'success',
                        message: 'Trees retrieved successfully',
                        data: trees
                    });
                }
            }
        );           
    }
);

/**
 * Fetch the tree with the id given in the path parameter
 */
router.get('/:nodeId',
    secure.secured,
    (req, res) => {
        console.log('Finding node with id: ' + req.params.nodeId);

        var user = getUserProfile(req);

        NodeModel.findOne({
            _id : req.params.nodeId,
            ownerId : user.id,
            ownerEmail: { $in : user.emails }
        }, 
        (err, tree) => {
            if(err) {
                console.log(err);
                res.status(400).json({
                    status: 'error',
                    message: err,
                });
            }
            else if(tree != null) {
                console.log('Node with id: ' + req.params.nodeId + ' found');
                res.status(200).json({
                    status: 'success',
                    message: 'tree retrieved successfully',
                    data: tree
                });
            }
            else {
                console.log('No tree with id: ' + req.params.nodeId + ' found');
                res.status(200).json({
                    status: 'failure',
                    message: 'No tree with id: ' + req.params.nodeId + ' found'
                });
            }
        });
    }
);

/**
 * Deletes the node with the id in the path parameter
 * as well as all its children from the database
 */
router.delete('/:nodeId',
    secure.secured,
    (req, res) => {
        var user = getUserProfile(req);

        console.log('Deleting node: ' + req.params.nodeId + ' for user: ' + user.emails[0]);

        NodeModel.findOneAndDelete({
            _id: req.params.nodeId,
        }, 
        (err, node) => {
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            //If the number deleted and number OK > 0
            else if(node.n != 0 && node.deleted != 0) {
                console.log('Node ' + req.params.nodeId + ' deleted');
                res.status(200).json({
                    status: "success",
                    message: 'Node ' + req.params.nodeId + ' deleted'
                });
            }
            else {
                console.log('No Node with id ' + req.params.nodeId + ' found');
                res.status(400).json({
                    message: 'No Node with id ' + req.params.nodeId + ' found'
                }); 
            }
        });
    }
);

//Export the router to be accessed in index.js
module.exports = router;