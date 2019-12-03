// treeModel.js
const mongoose = require('mongoose');
const validator = require('validator');
// Setup schema

var NodeSchema = mongoose.Schema({
    root: {
        type: Boolean,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    dueDate: {
        type: Date,
        default: Date.now 
    },
    ownerId: {
        type: String,
        required: true,
    },
    ownerEmail: {
            type: String,
            required: true,
            lowercase: true,
            validate: value => {
                if(!validator.isEmail(value)){
                    throw new Error({error: 'Invalid Email address'})
                }
            },
            required: true
    },
    sharedUsers: [{
        type: String,
        required: true,
        lowercase: true,
        validate: value => {
            if(!validator.isEmail(value)){
                throw new Error({error: 'Invalid Email address'})
            }
        },  
    }],
    isComplete: Boolean,
    isOverdue: Boolean,
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Node'
    }]
});

var autoPopulateChildren = function(next) {
    this.populate('children');
    next();
};

NodeSchema
    .pre('findOne', autoPopulateChildren)
    .pre('find', autoPopulateChildren);

    
NodeSchema.post('findOneAndDelete', function(doc) {
    var children = doc.children;
    if(children.length != 0){
        this.model.deleteMany({_id : {$in : children }},
            function(err){
                if(err){
                    console.log(err);
                }
                else {
                    console.log('deleted children');
                }
            }
        );
    };
});

// Export Tree model
var Node = module.exports = mongoose.model('Node', NodeSchema);
module.exports.get = function (callback, limit) {
    Node.find(callback).limit(limit);
}