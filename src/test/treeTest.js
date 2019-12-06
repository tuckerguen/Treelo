var app = require('../index');
var chai = require('chai');
var request = require('supertest');    
var expect = chai.expect;
Node = require('../models/nodeModel');

//Mock user data
const test_user = {
    _raw: 'raw',
    _json: '{}',
    emails: [{
        value: 'autotest@test.com'
    }],
    id: 'test|5dcf7e98bfb28c0ecba5c9f2'
};

// Key values that belong to all nodes
const node_keys = [
    'sharedUsers', 'children', '_id', 'dueDate', 'title',
    'description', 'ownerId', 'ownerEmail', 'isComplete', 'isOverdue'
];

// Mock root node
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

// Mock child node
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

var tempTreeId;

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

describe('Node Creation', () => {
    /*
    * Test the POST /newTree route for valid root
    */
    describe('POST /newTree', () => {
        it('Creates a new tree', () => {
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
            }
        );

        /*
        * Test the POST /newTree route for invalid root
        */
        it('creates a new tree', () => {
            return request(app)
                .post('/trees/newTree')
                .send({})
                .expect(400)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect((res) => {
                    expect(res.body.message).to.equal('No node sent with request');
                });          
            }
        );
    });
    
    /*
    *   Test the POST /addNode/:parentId endpoint
    */
    describe('POST /addNode/:parentId', () => {
        
        /**
         * Test adding a valid node on an existing node
         */
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
            }
        );

        /**
         * Test adding an invalid node on an existing node
         */
        it('Adds a new node to the parent with id = nodeId', () => {
            return request(app)
                .post('/trees/addNode/' + tempTreeId)
                .send({})
                .expect(400)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect((res) => {
                    expect(res.body.message).to.equal('No node sent with request');
                });          
            }
        );

        /**
         * Test adding a node on a not existing node
         */
        it('Adds a new node to the parent with id = nodeId', () => {
            return request(app)
                .post('/trees/addNode/1234')
                .send(test_child)
                .expect(400)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect((res) => {
                    expect(res.body.message).to.equal('Error');
                    expect(res.body.data.message).to.equal(`Cast to ObjectId failed for value "1234" at path "_id" for model "Node"`);
                });          
            }
        );
    });
});


/*
*   Test the PUT /details/:nodeId endpoint
*/
describe('Test PUT /details/:nodeId', () => {
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

    it('Updates the data stored in the node with id = nodeId',
        () => {
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
        }
    );

    it('Returns that the node does not exist and returns a cast error',
        () => {
            return request(app)
                .put('/trees/details/1234')
                .send(updated_node)
                .set('Accept', 'application/json')
                .expect(400)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect((res) => {
                    expect(res.body.message).to.equal('Error');
                    expect(res.body.data.message).to.equal(`Cast to ObjectId failed for value "1234" at path "_id" for model "Node"`);
                });      
        }
    );

    it('Returns that no node was sent with the request',
        () => {
            return request(app)
                .put('/trees/details/' + tempTreeId)
                .send({})
                .set('Accept', 'application/json')
                .expect(400)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect((res) => {
                    expect(res.body.message).to.equal('No node sent with request')
                });      
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
                    expect(res.body.data)
                        .to.be.an.instanceOf(Array)
                        .and.to.have.length(1)
                        .and.to.have.property(0)
                        .that.includes.all.keys(node_keys);
                    Object.keys(res.body.data[0]).forEach((key) => {
                        expect(res.body.data[0].key).to.deep.equal(test_root.tree.key);
                    });
                });           
        }
    );
});


/*
*   Test GET the /:nodeId endpoint 
*/
describe('GET /:nodeId', () => {

    /**
     * Test retrieve valid nodeId
     */
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

    /**
     * Test retrieve invalid nodeId
     */
    it("responds with tree with Id = nodeId", 
        () => {
            return request(app)
                .get('/trees/1234')
                .set('Accept', 'application/json')
                .expect(400)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect((res) => {
                    expect(res.body.message).to.equal('Error');
                    expect(res.body.data.message).to.equal(`Cast to ObjectId failed for value "1234" at path "_id" for model "Node"`);
                });           
        }
    );
});

/*
*   Test the DELETE /:nodeId endpoint
*/
describe('Test delete /:nodeId', () => {

    /**
     * Test delete for valid nodeId
     */
    it('Deletes the node and all children from the database',
        () => {
            return request(app)
                .delete('/trees/' + tempTreeId)
                .expect(200)
                .expect((res) => {
                    expect(res.body.message).to.be.equal('Node ' + tempTreeId + ' deleted');
                });
        }
    );

    /**
     * Test delete for invalid nodeId
     */
    it("Returns that the node doesn't exist",
        () => {
            return request(app)
                .delete('/trees/' + tempTreeId)
                .expect(400)
                .expect((res) => {
                    expect(res.body.message).to.be.equal('No Node with id ' + tempTreeId + ' found');
                });
        }
    );
});