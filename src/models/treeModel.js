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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        validate: {
            isAsync: true,
            validator: function(v){
                return fkHelper(mongoose.model('User'), v);
            },
            message: "User doesn't exist"
        },
        required: true
    },
    sharedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        validate: {
            isAsync: true,
            validator: function(v){
                return fkHelper(mongoose.model('User'), v);
            },
            message: "User doesn't exist"
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