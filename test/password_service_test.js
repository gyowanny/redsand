var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var describe = require("mocha").describe;
var it = require("mocha").it;
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var afterEach = require("mocha").afterEach;
var beforeEach = require("mocha").beforeEach;
var bcrypt = require('bcrypt');

describe('Password service', function() {

    var instance;
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    it('should encrypt the password', function(done) {
        //Given
        var expectedHashedPassword = 'hashed-password';
        var callback = function(err, hashedPwd) {
            return hashedPwd;
        }
        var bcryptStub = sandbox.stub(bcrypt, 'hash')
            .withArgs('plain-password', 10, callback).returns(expectedHashedPassword);
        instance = proxyquire('../service/password_service', {'bcrypt': bcryptStub});

        //When
        instance.encrypt('plain-password', 10, function(err, hashedPwd) {
            //Then
            expect(hashedPwd).to.be.equal(expectedHashedPassword);
        });

        done();
    });

    //TODO: should fail when plain password is null
    //TODO: should fail when salt is null
    //TODO: should fail when salt is zero

    //TODO: (tests for matches function)
});
