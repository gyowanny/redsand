var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var describe = require("mocha").describe;
var it = require("mocha").it;
var afterEach = require("mocha").afterEach;
var beforeEach = require("mocha").beforeEach;
var MockExpressRequest = require('mock-express-request');
var tokenService = require("../../../service/token_service.js");
var proxyquire = require("proxyquire");
var sinon = require("sinon");

describe('API - Validate Route', function() {

    var instance;
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        sandbox.restore();
    });

    it('Should return 204 for a valid token', function(done) {
        //Given
        var expectedToken = 'token';
        var request = new MockExpressRequest({
            method: 'POST',
            url: 'url',
            headers: {
                'Accept': 'application/json'
            },
            body: {
                token: expectedToken
            }
        });
        var response = {
            actualStatus: 0,
            status: function(st) {
                this.actualStatus = st;
                return this;
            },
            send: function(value) {
                // Then
                expect(this.actualStatus).to.be.equal(204);
                done();
            }
        };
        var tokenServiceMock = sandbox.stub(tokenService);

        instance = proxyquire('../../../route/api/validate_route', {'tokenService': tokenServiceMock});

        // When
        instance(request, response);
        tokenServiceMock.validateAndDecode.callArg(2).withArgs(null, 'decoded');
    });

    it('Should return 204 when user is the same as the token', function(done) {
        //Given
        var expectedUser = {login: 'login'};
        var request = new MockExpressRequest({
            method: "POST",
            url: "url",
            headers: {
                "Accept": "application/json"
            },
            body: {
                token: "expectedToken",
                user: expectedUser
            }
        });
        var response = {
            actualStatus: 0,
            status: function(st) {
                this.actualStatus = st;
                return this;
            },
            send: function(value) {
                // Then
                expect(this.actualStatus).to.be.equal(204);
                done();
            }
        };
        var tokenServiceMock = sandbox.stub(tokenService);
        tokenServiceMock.validateAndDecode.yieldsRight(null, {user: expectedUser});

        instance = proxyquire('../../../route/api/validate_route', {'tokenService': tokenServiceMock});

        // When
        instance(request, response);
        // tokenServiceMock.validateAndDecode.callArg(2).withArgs(null, {user: expectedUser});

    });

    it('Should return 403 when the user is not the same as the token', function(done) {
        //Given
        var expectedToken = 'token';
        var request = new MockExpressRequest({
            method: 'POST',
            url: 'url',
            headers: {
                'Accept': 'application/json'
            },
            body: {
                token: expectedToken,
                user: "user"
            }
        });
        var response = {
            actualStatus: 0,
            status: function(st) {
                this.actualStatus = st;
                return this;
            },
            send: function(value) {
                // Then
                expect(this.actualStatus).to.be.equal(403);
                done();
            }
        };
        var tokenServiceMock = sandbox.stub(tokenService);
        tokenServiceMock.validateAndDecode.yieldsRight({user: 'different_user'});

        instance = proxyquire('../../../route/api/validate_route', {'tokenService': tokenServiceMock});

        // When
        instance(request, response);

    });

    it('Should return 403 when invalid body is sent', function(done) {
        //Given
        var request = new MockExpressRequest({
            method: 'POST',
            url: 'url',
            headers: {
                'Accept': 'application/json'
            },
            body: {
                user: "user"
            }
        });
        var response = {
            actualStatus: 0,
            status: function(st) {
                this.actualStatus = st;
                return this;
            },
            send: function(message) {
                // Then
                expect(this.actualStatus).to.be.equal(403);
                expect(message).to.be.equal('INVALID_BODY');
                done();
            }
        };

        // When
        instance(request, response);

    });

    it('Should return 403 when invalid token is sent', function(done) {
        //Given
        var request = new MockExpressRequest({
            method: 'POST',
            url: 'url',
            headers: {
                'Accept': 'application/json'
            },
            body: {
                token: "invalid"
            }
        });
        var response = {
            actualStatus: 0,
            status: function(st) {
                this.actualStatus = st;
                return this;
            },
            send: function(value) {
                // Then
                expect(this.actualStatus).to.be.equal(403);
                done();
            }
        };

        // When
        instance(request, response);

    });
});

