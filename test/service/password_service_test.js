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

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
        instance = require('../../service/password_service');
    });

    afterEach(function() {
        sandbox.restore();
    })

    it('should encrypt the password', function() {
        //Given
        var expectedHashedPassword = 'hashed-password';
        bcrypt.hashSync = sandbox.stub().returns(expectedHashedPassword);

        instance = proxyquire('../../service/password_service', {'bcrypt': bcrypt});

        //When
        var hashedPassword = instance.encrypt('plain-password', 10);
        expect(bcrypt.hash).to.be.calledOnce;
        expect(hashedPassword).to.be.equal(expectedHashedPassword);

    });

    it('encrypt should return null when plain password is null', function() {
        //When
        expect(instance.encrypt(null, 10)).to.be.null;
    });

    it('encrypt should return null when salt is null', function() {
        //When
        expect(instance.encrypt(null, null)).to.be.null;
    });

    it('encrypt should return null when salt is 0', function() {
        //When
        expect(instance.encrypt(null, 0)).to.be.null;
    });

    it('valid password should return true', function() {
        //Given
        var expectedHashedPassword = 'hashed-pwd';
        bcrypt.compareSync = sandbox.stub().returns(true);

        instance = proxyquire('../../service/password_service', {'bcrypt': bcrypt});

        //When
        expect(instance.matches('plain-password', expectedHashedPassword)).to.be.true;
    });
});
