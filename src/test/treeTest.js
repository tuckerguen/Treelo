var app = require('../index');
var chai = require('chai');
var request = require('supertest');    
var expect = chai.expect;

describe('Get /trees', function(){    
    it('responds with treeView html page', function(done){
        console.log('sending request');
         request(app)
            .get('/trees')
            .end(function(err, res){
                console.log(res.statusCode);
                expect(res.statusCode).to.equal(200);
                if(err) {
                    console.log(err);
                    return done(err);
                }
                console.log('request done');
                done();
            });
    }); 
});