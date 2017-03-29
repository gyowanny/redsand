var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var expect = chai.expect;
var describe = require("mocha").describe;
var it = require("mocha").it;
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var afterEach = require("mocha").afterEach;
var beforeEach = require("mocha").beforeEach;
var jwt = require('jsonwebtoken');

chai.use(chaiHttp);

describe('Token service', function() {

    var instance;
    var user = {login: 'login', password: 'password'};
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    it('should return a json web token value when successful login', function(done) {
        //Given
        var expectedToken = 'signed-token';
        var jsonwWebToken = sandbox.stub(jwt, 'sign')
            .withArgs(user, 'secret-key', { expiresIn: '1d' }).returns(expectedToken);
        instance = proxyquire('../service/token_service', {'jsonwWebToken': jsonwWebToken});

        //When
        var token = instance.generateToken(user, 'secret-key', '1d');

        //Then
        expect(token).to.be.equal(expectedToken);

        done();
    });

    it('should return null if user is not provided', function(done) {
       //Given
        var expectedToken = null;

        //When
        var token = instance.generateToken(null, 'secret-key', '1d');

        //Then
        expect(token).to.be.null;

        done();
    });

    it('should return null if user is empty', function(done) {
        //Given
        var expectedToken = null;

        //When
        var token = instance.generateToken({}, 'secret-key', '1d');

        //Then
        expect(token).to.be.null;

        done();
    });

    afterEach(function(done) {
        sandbox.restore();
        done();
    });
});