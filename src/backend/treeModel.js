// treeModel.js
var mongoose = require('mongoose');
// Setup schema

var Node = mongoose.Schema({
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
        required: true
    },
    sharedUsers: [String],
    isComplete: Boolean,
    isOverdue: Boolean,
    children: [this]
});

// Export Tree model
var treeModel = module.exports = mongoose.model('Tree', Node);
module.exports.get = function (callback, limit) {
    treeModel.find(callback).limit(limit);
}