var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var describe = require("mocha").describe;
var it = require("mocha").it;
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var afterEach = require("mocha").afterEach;
var beforeEach = require("mocha").beforeEach;
var jwt = require('jsonwebtoken');

describe('Token service', function() {

    var instance;
    var user = {login: 'login', password: 'password'};
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    it('should return a json web token value for a valid user', function(done) {
        //Given
        var expectedToken = 'signed-token';
        var jsonwWebToken = sandbox.stub(jwt, 'sign')
            .withArgs(user, 'secret-key', { expiresIn: '1d' }).returns(expectedToken);
        instance = proxyquire('../service/token_service', {'jsonwWebToken': jsonwWebToken});

        //When
        var token = instance.generate(user, 'secret-key', '1d');

        //Then
        expect(token).to.be.equal(expectedToken);

        done();
    });

    it('should return null if user is not provided', function(done) {
       //Given
        var expectedToken = null;

        //When
        var token = instance.generate(null, 'secret-key', '1d');

        //Then
        expect(token).to.be.null;

        done();
    });

    it('should return null if user is empty', function(done) {
        //Given
        var expectedToken = null;

        //When
        var token = instance.generate({}, 'secret-key', '1d');

        //Then
        expect(token).to.be.null;

        done();
    });

    it('should validate a token and returns it decoded', function(done) {
        //Given
        var expectedToken = 'decoded-token';
        var callback = function(err, decoded) {
            return decoded;
        }
        var jsonwWebToken = sandbox.stub(jwt, 'verify')
            .withArgs('token', 'secret-key', callback).returns(expectedToken);
        instance = proxyquire('../service/token_service', {'jsonwWebToken': jsonwWebToken});

        //When
        instance.validateAndDecode('token', 'secret-key', function(err, decoded) {
            //Then
            expect(decoded).to.be.equal(expectedToken);
        });

        done();
    });

    it('should return error if the token is null', function(done) {
        //When
        instance.validateAndDecode(null, 'secret-key', function(err, decoded) {
           //Then
            expect(err).to.not.be.null;
        });

        done();
    });

    it('should return error if the secret key is null', function(done) {
        //When
        instance.validateAndDecode('token', null, function(err, decoded) {
            //Then
            expect(err).to.not.be.null;
        });

        done();
    });

    afterEach(function(done) {
        sandbox.restore();
        done();
    });
});