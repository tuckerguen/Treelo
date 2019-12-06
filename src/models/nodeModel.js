/**
 * nodeModel.js
 * Definition of the schema for the MongoDB database
 * documents representing individual nodes
 */

// Import mongoose and validation for email format
const mongoose = require('mongoose');
const validator = require('validator');

// Document schema for a node of a tree
var NodeSchema = mongoose.Schema({
    // Is this node the root of the tree
    root: {
        type: Boolean,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    dueDate: {
        type: String,
    },
    ownerId: {
        type: String,
        required: true,
    },
    ownerEmail: {
            type: String,
            required: true,
            lowercase: true,
            //Confirm valid email
            validate: value => {
                if(!validator.isEmail(value)){
                    throw new Error({error: 'Invalid Email address'})
                }
            },
            required: true
    },
    // Array of emails of users this node is shared with
    sharedUsers: [{
        type: String,
        required: true,
        lowercase: true,
        //Confirm valid email
        validate: value => {
            if(!validator.isEmail(value)){
                throw new Error({error: 'Invalid Email address'})
            }
        },  
    }],
    isComplete: Boolean,
    isOverdue: Boolean,
    // Array of id's referencing the children nodes of this node
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Node'
    }]
});

/**
 * Populates the array of children for this node
 * via their document ids
 */
var autoPopulateChildren = function(next) {
    this.populate('children');
    next();
};

/**
 * Define pre query hooks for findOne() and find() so that
 * a tree recursively populates its children, children's children,
 * etc, to return the entire tree as one Node object
 */
NodeSchema
    .pre('findOne', autoPopulateChildren)
    .pre('find', autoPopulateChildren);


/**
 * Define a post query hook for findOneAndDelete implementing
 * the equivalent of CASCADE DELETE in a traditional relationsal
 * database
 */
NodeSchema.post('findOneAndDelete', function(doc) {
    if(doc != null) {
        var children = doc.children;

        //If the deleted node has children
        if(children.length != 0){
            //Delete all children
            this.model.deleteMany({_id : {$in : children }},
                (err) => {
                    if(err){
                        console.log(err);
                    }
                    else {
                        console.log('Deleted children of node: ' + doc._id);
                    }
                }
            );
        };
    }
});

// Export the schema
var Node = module.exports = mongoose.model('Node', NodeSchema);
module.exports.get = (callback, limit) => {
    Node.find(callback).limit(limit);
}