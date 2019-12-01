var app = require('../index');
var chai = require('chai');
var request = require('supertest');    
var expect = chai.expect;
Node = require('../models/nodeModel');

const test_user = {
    _raw: 'raw',
    _json: '{}',
    emails: [{
        value: 'autotest@test.com'
    }],
    id: 'test|5dcf7e98bfb28c0ecba5c9f2'
};

const test_tree = {
    "tree": {
        title: "TEST TITLE",
        description: "test description",
        dueDate: "",
        sharedUsers: [
            "janedoe@gmail.com",
            "benbaierl@case.edu"
        ],
        isComplete: false,
        isOverdue: false,
        children: [
            {
                title: "Child1",
                description: "child 1 description",
                dueDate: "",
                owner: "johndoe@gmail.com",
                sharedUsers: [
                    "janedoe@gmail.com",
                    "steve@gmail.edu"
                ],
                isComplete: false,
                isOverdue: false,
                children: []
            }
        ]
    }
}

function createTree(tree) {
    var treeId;
    var tree = new Node();
    tree.title = tree.title;
    tree.description = tree.description;
    tree.dueDate = tree.dueDate ? tree.dueDate : new Date();
    tree.ownerId = test_user.id;
    tree.ownerEmail = test_user.emails[0].value;
    tree.sharedUsers = tree.sharedUsers;
    tree.isComplete = tree.isComplete;
    tree.isOverdue = tree.isOverdue ? tree.isOverdue : false;
    tree.children = tree.children;
    tree.save(function (err) {
        console.log('created: ' + tree._id);
        treeId = tree._id;
    });
    return treeId;
};

function deleteTree(treeId) {
    Node.deleteMany({
        _id: treeId
    }, (err, node) => {
        if(err) {
            console.log(err);
        }
        else {
            console.log(node);
        }
    });
};

describe('Test GET /', function(){    
    it('responds with treeView html page', 
        () => {
            return request(app)
                .get('/trees')
                .expect(200)
                .expect('Content-Type', 'text/html; charset=UTF-8')
        }
    ); 
});

var tempTreeId;
describe('Test POST /', function(){
    it('creates a new tree and responds with the object stored', 
        () => {
            return request(app)
                .post('/trees')
                .send(test_tree)
                .expect(201)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect((res) => {
                    expect(res.body.data._id).to.exist;
                    tempTreeId = res.body.data._id;
                    expect(res.body).to.exist;
                    expect(res.body.message).to.equal('New tree created!');
                    expect(res.body.data)
                        .that.includes.all.keys([
                            'sharedUsers', 'children', '_id', 'dueDate', 'title',
                            'description', 'ownerId', 'ownerEmail', 'isComplete', 'isOverdue'
                        ]);
                    expect(res.body.data.sharedUsers).to.be.an.instanceof(Array)
                        .and.to.have.length(2)
                        .and.to.include.members([
                            "janedoe@gmail.com",
                            "benbaierl@case.edu"
                        ]);
                    expect(res.body.data.children).to.be.an.instanceof(Array)
                        .to.have.length(1);
                    console.log('deleting: ' + tempTreeId);
                });          
        });
});

describe('Test GET /data', function() {
    it("responds with all of a user's trees", 
        () => {
            return request(app)
                .get('/trees/data')
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect((res) => {
                    expect(res.body.data)
                        .to.be.an.instanceOf(Array)
                        .and.to.have.property(0)
                        .that.includes.all.keys([
                            'sharedUsers', 'children', '_id', 'dueDate', 'title', 
                            'description','ownerId', 'ownerEmail', 'isComplete', 'isOverdue'
                        ]);
                });           
        });
});

describe('Test GET /:treeId', function() {
    it("responds with tree with Id = treeId", 
        () => {
            return request(app)
                .get('/trees/' + tempTreeId)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(function(res){
                    console.log(res.body.data);
                    expect(res.body.data)
                        .includes.all.keys([
                            'sharedUsers', 'children', '_id', 'dueDate', 'title', 
                            'description','ownerId', 'ownerEmail', 'isComplete', 'isOverdue'
                        ]);
                    Node.deleteMany({
                        _id: tempTreeId
                    }, (err, node) => {
                        if(err) {
                            console.log(err);
                        }
                        else {
                            console.log('deleted: ' + node._id);
                        }
                    });
                });           
    });
});