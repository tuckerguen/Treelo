// treeModel.js
var mongoose = require('mongoose');
// Setup schema
var treeSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    gender: String,
    phone: String,
    create_date: {
        type: Date,
        default: Date.now
    }
});
// Export Tree model
var Tree = module.exports = mongoose.model('tree', treeSchema);
module.exports.get = function (callback, limit) {
    Tree.find(callback).limit(limit);
}