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

const node_keys = [
    'sharedUsers', 'children', '_id', 'dueDate', 'title',
    'description', 'ownerId', 'ownerEmail', 'isComplete', 'isOverdue'
];

const test_root = {
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
        children: []
    }
}

const test_child = {
    "tree": {
        title: "Child",
        description: "Child's description",
        dueDate: "",
        sharedUsers: [
            "janedoe@gmail.com",
            "benbaierl@case.edu"
        ],
        isComplete: false,
        isOverdue: false,
        children: []
    }
}

var saveRoot = (tree) => {
    var treeId;
    var newTree = new Node();
    newTree.title = tree.title;
    newTree.description = tree.description;
    newTree.dueDate = tree.dueDate ? tree.dueDate : new Date();
    newTree.ownerId = test_user.id;
    newTree.ownerEmail = test_user.emails[0].value;
    newTree.sharedUsers = tree.sharedUsers;
    newTree.isComplete = tree.isComplete;
    newTree.isOverdue = tree.isOverdue ? tree.isOverdue : false;
    newTree.children = tree.children;
    newTree.save((err) => {
        console.log('created: ' + newTree._id);
        treeId = newTree._id;
    });
    return treeId;
};

// beforeEach((done) => {
//     //Empty database
//     Node.deleteMany({}, (err) => {
//         done();
//     });  
// });

var tempTreeId;
describe('Node creation', () => {
    /*
    * Test the POST /newTree route
    */
    describe('POST /newTree', () => {
        it('creates a new tree', () => {
            return request(app)
                .post('/trees/newTree')
                .send(test_root)
                .expect(201)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect((res) => {
                    var newRoot = res.body.data;
                    expect(newRoot._id).to.exist;
                    tempTreeId = newRoot._id;
                    expect(res.body).to.exist;
                    expect(res.body.message).to.equal('New tree created');
                    expect(newRoot).that.includes.all.keys(node_keys);
                    expect(newRoot.sharedUsers)
                        .to.be.an.instanceof(Array)
                        .and.to.have.length(2)
                        .and.to.include.members(test_root.tree.sharedUsers);
                    expect(newRoot.children)
                        .to.be.an.instanceof(Array)
                        .to.have.length(0);
                    Object.keys(newRoot).forEach((key) => {
                        expect(newRoot.key).to.deep.equal(test_root.tree.key);
                    });
                });          
            });
    });
    
    /*
    *   Test the POST /addNode/:nodeId endpoint
    */
    describe('POST /addNode/:nodeId', () => {
        it('Adds a new node to the parent with id = nodeId', () => {
            return request(app)
                .post('/trees/addNode/' + tempTreeId)
                .send(test_child)
                .expect(201)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect((res) => {
                    var newChild = res.body.data;
                    expect(newChild._id).to.exist;
                    expect(res.body).to.exist;
                    expect(res.body.message).to.equal('New node added');
                    expect(newChild).that.includes.all.keys(node_keys);
                    expect(newChild.sharedUsers)
                        .to.be.an.instanceof(Array)
                        .and.to.have.length(2)
                        .and.to.include.members(test_child.tree.children);
                    expect(newChild.children)
                        .to.be.an.instanceof(Array)
                        .to.have.length(0);
                    //Check for parent has child set properly
                    Node.findById(tempTreeId, (err, parent) => {
                        expect(parent.children)
                            .to.be.an.instanceof(Array)
                            .and.to.have.length(1);
                            
                        child = parent.children[0].toJSON();
                        expect(child).that.includes.all.keys(node_keys);
                        Object.keys(child).forEach((key) => {
                            expect(child.key).to.equal(test_child.key);
                        });
                    });
                });          
        });
    });
});

/*
*   Test the GET / endpoint
*/
describe('GET /', () => {    
    it('responds with treeView html page', 
        () => {
            return request(app)
                .get('/trees')
                .expect(200)
                .expect('Content-Type', 'text/html; charset=UTF-8')
        }
    ); 
});

/*
*   Test the GET /data endpoint
*/
describe('GET /data', () => {
    it("responds with all of a user's trees", 
        () => {
            return request(app)
                .get('/trees/data')
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect((res) => {
                    console.log(res.body);
                    expect(res.body.data)
                        .to.be.an.instanceOf(Array)
                        .and.to.have.property(0)
                        .that.includes.all.keys(node_keys);
                });           
        });
});

/*
*   Test GET the /:nodeId endpoint 
*/
describe('GET /:nodeId', () => {
    it("responds with tree with Id = nodeId", 
        () => {
            return request(app)
                .get('/trees/' + tempTreeId)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect((res) => {
                    expect(res.body.data).includes.all.keys(node_keys);
                });           
        }
    );
});


/*
*   Test the PUT /details/:nodeId endpoint
*/
//Test nodeId doesn't exist
describe('Test PUT /details/:nodeId', () => {
    it('updates the data stored in the node with id = nodeId',
        () => {
            var updated_node = {
                node: {
                    title: "Updated title",
                    description: "updated description",
                    dueDate: "",
                    sharedUsers: [
                        "benbaierl@case.edu"
                    ],
                    isComplete: true,
                    isOverdue: true,
                    children: []
                }
            }

            return request(app)
                .put('/trees/details/' + tempTreeId)
                .send(updated_node)
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect((res) => {
                    var node = res.body.data;
                    expect(node).includes.all.keys(node_keys);
                    Object.keys(node).forEach((key) => {
                        expect(node.key).to.equal(updated_node.key);
                    });
                });      
        });
});

/*
*   Test the DELETE /:nodeId endpoint
*/
describe('Test delete /:nodeId', () => {
    it('deletes the node and all children from the database',
        () => {
            return request(app)
                .delete('/trees/' + tempTreeId)
                .expect(200)
                .expect((res) => {
                    expect(res.body.message).to.be.equal('Node ' + tempTreeId + ' deleted');
                });
        });
});