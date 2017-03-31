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
var verify = require('jsonwebtoken/verify');
var JsonWebTokenError = require('jsonwebtoken/lib/JsonWebTokenError');

describe('Token service', function() {

    var instance;
    var user = {login: 'login', password: 'password'};
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('should return a json web token value for a valid user', function() {
        //Given
        var expectedToken = 'signed-token';
        var jsonwWebToken = sandbox.stub(jwt, 'sign')
            .withArgs(user, 'secret-key', { expiresIn: '1d' }).returns(expectedToken);
        instance = proxyquire('../../service/token_service', {'jsonwWebToken': jsonwWebToken});

        //When
        var token = instance.generate(user, 'secret-key', '1d');

        //Then
        expect(token).to.be.equal(expectedToken);
        expect(jsonwWebToken.sign).to.be.calledOnce;
    });

    it('should return null if user is not provided', function() {
        // When
        var token = instance.generate(null, 'secret-key', '1d');

        // Then
        expect(token).to.be.null;
    });

    it('should return null if user is empty', function() {
        // When
        var token = instance.generate({}, 'secret-key', '1d');

        // Then
        expect(token).to.be.null;
    });

    it('should validate a token and returns it decoded', function() {
        // Given
        var expectedToken = 'decoded-token';
        var jsonWebToken = sandbox.stub(jwt, 'verify').returns(expectedToken)
        instance = proxyquire('../../service/token_service', {'jsonWebToken': jsonWebToken});

        // When
        var decodedToken = instance.validateAndDecode('token', 'secret-key');

        // Then
        expect(decodedToken).to.be.equal(expectedToken);
    });

    it('should return jwt must be provided error on validate and decode if the token is null', function() {
        // Given
        var expectedError = new JsonWebTokenError('jwt must be provided');
        var jsonWebToken = sandbox.stub(jwt, 'verify').throws(expectedError);
        instance = proxyquire('../../service/token_service', {'jsonWebToken': jsonWebToken});
        var actualError;

        // When
        try {
            instance.validateAndDecode(null, 'secret-key');
        } catch(err) {
            actualError = err;
        }

        // Then
        expect(actualError).to.be.equal(expectedError);
    });

    it('should return jwt malformed error on validate and decode if the secret key is null', function() {
        // Given
        var expectedError = new JsonWebTokenError('jwt malformed');
        var jsonWebToken = sandbox.stub(jwt, 'verify').throws(expectedError);
        instance = proxyquire('../../service/token_service', {'jsonWebToken': jsonWebToken});
        var actualError;

        // When
        try {
            instance.validateAndDecode(null, 'secret-key');
        } catch(err) {
            actualError = err;
        }

        // Then
        expect(actualError).to.be.equal(expectedError);
    });

});