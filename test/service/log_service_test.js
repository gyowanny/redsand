var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var describe = require("mocha").describe;
var it = require("mocha").it;
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var afterEach = require("mocha").afterEach;
var beforeEach = require("mocha").beforeEach;
var logDao = require('../../data/log_dao');

describe('Log service', function() {

    var instance;
    var logDaoMock;
    var sandbox;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();

    });

    afterEach(function() {
        sandbox.restore();
    });

    it('Should log user authentication', function(done) {
        // Given
        var login = 'user_login';
        var orgId = 'org_id';
        var ip = '127.0.0.1';
        logDaoMock = sandbox.stub(logDao, 'save').callsFake(function(log, callback) {
            expect(log).to.not.be.null;
            expect(log.subject).to.be.equal('AUTHENTICATION')
            expect(log.org_id).to.be.equal(orgId);
            expect(log.ip).to.be.equal(ip);
            expect(log.data).to.not.be.null;
            expect(log.data.login).to.be.equal(login);
            expect(log.timestamp).to.not.be.null;

            callback(null, 'CREATED');
        });
        instance = proxyquire('../../service/log_service', {logDao: logDaoMock});

        // When
        instance.logUserAuthentication(login, orgId, ip, function(err, result) {

            // Then
            expect(err).to.be.null;
            expect(result).to.be.equal('OK');

            done();
        });
    });

});