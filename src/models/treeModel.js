// treeModel.js
var mongoose = require('mongoose');
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
        required: true
    },
    sharedUsers: [String],
    isComplete: Boolean,
    isOverdue: Boolean,
    children: [this]
});

// Export Tree model
var Tree = module.exports = mongoose.model('Tree', NodeSchema);
module.exports.get = function (callback, limit) {
    Tree.find(callback).limit(limit);
}