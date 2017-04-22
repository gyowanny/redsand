var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var describe = require("mocha").describe;
var it = require("mocha").it;
var afterEach = require("mocha").afterEach;
var beforeEach = require("mocha").beforeEach;
var config = require("../../config_test.js");
var userDao = require("../../../data/user_dao.js");
var passwordService = require("../../../service/password_service.js");
var MockExpressRequest = require('mock-express-request');
var db = require("../../../data/db.js");
var r = require('rethinkdb');
var orgDao = require("../../../data/org_dao.js");

describe('API - Authentication route', function() {

    var instance;

    var createUser = function(callback) {
        var user = {
            login: 'login',
            password: 'password',
            email: 'user@user.com',
            fullName: 'full name',
            orgs: [
                {
                    org_id: 'org_id',
                    roles: ['ROLE1', 'ROLE_2', 'ROLE_3', 'ROLE_4']
                }
            ],
            create_date: new Date()
        };

        user.password = passwordService.encrypt(user.password, config.password.saltRounds);
        userDao.save(user, function(err, result) {
            expect(err).to.be.null;

            callback(result);
        });

    };

    var createOrg = function(callback) {
        var org = {
            org_id: "org_id",
            name: "Simple App Test",
            tokenExpiration: "24h",
            inactive: false
        }

        orgDao.save(org, function(err, result) {
            expect(err).to.be.null;

            callback(result);
        })
    };

    beforeEach(function (done) {
        instance = require('../../../route/api/auth_route');
        db.init(config, function(err, connection) {
            db.global.connection = connection;
            done();
        });
    });

    afterEach(function (done) {
        r.table('orgs').delete().run(db.global.connection, function(err, result) {
            r.table('users').delete().run(db.global.connection, function (err, result) {
                done();
            });
        });
    });

    it('should authenticate an existing user', function (done) {
        //Given
        createOrg(function(result) {
            createUser(function (result) {
                var reqBody = {
                    auth: "bG9naW46cGFzc3dvcmQ=",
                    org_id: "org_id"
                }
                var request = new MockExpressRequest({
                    method: 'POST',
                    url: 'url',
                    headers: {
                        'Accept': 'application/json'
                    },
                    body: reqBody
                });
                var response = {
                    actualStatus: 200,
                    status: function(st) {
                        this.actualStatus = st;
                    },
                    json: function(value) {
                        expect(this.actualStatus).to.be.equal(200);
                        expect(value).to.not.be.null;
                        expect(value.token).to.not.be.null;

                        done();
                    }
                };

                //When
                instance(request, response);

            });
        });
    });

    it('should return status code 403 and UNAUTHORIZED message for non-existing user', function (done) {
        //Given
        createOrg(function(result) {
            createUser(function (result) {
                var reqBody = {
                    auth: "aW52YWxpZDpwYXNzd29yZA==",
                    org_id: "org_id"
                }
                var request = new MockExpressRequest({
                    method: 'POST',
                    url: 'url',
                    headers: {
                        'Accept': 'application/json'
                    },
                    body: reqBody
                });
                var response = {
                    actualStatus: 200,
                    status: function(st) {
                        this.actualStatus = st;
                        return this;
                    },
                    json: function(value) {
                        expect(this.actualStatus).to.be.equal(403);
                        expect(value.token).to.be.an('undefined');
                        expect(value.roles).to.be.an('undefined');
                        expect(value.success).to.be.false;
                        expect(value.message).to.be.equal('UNAUTHORIZED');

                        done();
                    }
                };

                //When
                instance(request, response);

            });
        });
    });

    it('should return status code 403 and UNAUTHORIZED message for wrong password', function (done) {
        //Given
        createOrg(function(result) {
            createUser(function (result) {
                var reqBody = {
                    auth: "bG9naW46aW52YWxpZA==",
                    org_id: "org_id"
                }
                var request = new MockExpressRequest({
                    method: 'POST',
                    url: 'url',
                    headers: {
                        'Accept': 'application/json'
                    },
                    body: reqBody
                });
                var response = {
                    actualStatus: 200,
                    status: function(st) {
                        this.actualStatus = st;
                        return this;
                    },
                    json: function(value) {
                        expect(this.actualStatus).to.be.equal(403);
                        expect(value.token).to.be.an('undefined');
                        expect(value.roles).to.be.an('undefined');
                        expect(value.success).to.be.false;
                        expect(value.message).to.be.equal('UNAUTHORIZED');

                        done();
                    }
                };

                //When
                instance(request, response);

            });
        });
    });

});