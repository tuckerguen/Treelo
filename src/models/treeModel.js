// treeModel.js
var mongoose = require('mongoose');
var fkHelper = require('./fkHelper');
// Setup schema

var NodeSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    dueDate: {
        type: Date,
        default: Date.now 
    },
    owner: {
        type: String,
        email: {
            type: String,
            unique: true,
            required: true,
            lowercase: true,
            validate: value => {
                if(!validator.isEmail(value)){
                    throw new Error({error: 'Invalid Email address'})
                }
            }
        },
        required: true
    },
    sharedUsers: [{
        type: String,
        email: {
            type: String,
            unique: true,
            required: true,
            lowercase: true,
            validate: value => {
                if(!validator.isEmail(value)){
                    throw new Error({error: 'Invalid Email address'})
                }
            }
        },
        required: true
    }],
    isComplete: Boolean,
    isOverdue: Boolean,
    children: [this]
});

// Export Tree model
var Tree = module.exports = mongoose.model('Tree', NodeSchema);
module.exports.get = function (callback, limit) {
    Tree.find(callback).limit(limit);
}