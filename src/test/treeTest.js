var app = require('../index');
var chai = require('chai');
var request = require('supertest');    
var expect = chai.expect;

const test_user = JSON.stringify({
    _raw: 'raw',
    _json: '{}',
    emails: [{
        value: 'test@test.com'
    }],
    id: 'auth0|5dcf7e98bfb28c0ecba5c9f2'
});

describe('Test GET /', function(){    
    it('responds with treeView html page', function(done){
         request(app)
            .get('/trees')
            .end(function(err, res){
                if(err) {
                    console.log(err);
                    return done(err);
                }
                
                if(res.statusCode == 302){
                    console.log('check that TESTING=TRUE in .env');
                }
                
                expect(res.statusCode).to.equal(200);
                expect('Content-Type', 'application/json')
                done();
            });
    }); 
});

describe('Test GET /data', function() {
    it("responds with all of a user's trees", function(done) {
        request(app)
            .get('/trees/data')
            .set('Accept', 'application/json')
            .end(function(err, res){
                if(err){
                    console.log(err);
                    return done(err);
                }
                expect(res.statusCode).to.equal(200);
                expect('Content-Type', 'application/json')
                expect(res.body.data)
                    .to.be.an.instanceOf(Array)
                    .and.to.have.property(0)
                    .that.includes.all.keys([
                        'sharedUsers',
                        'children',
                        '_id',
                        'dueDate',
                        'title',
                        'description',
                        'ownerId',
                        'ownerEmail',
                        'isComplete',
                        'isOverdue'
                    ]);
            });
        done();
    });
});