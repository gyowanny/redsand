var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var describe = require("mocha").describe;
var it = require("mocha").it;
var sinon = require('sinon');
var afterEach = require('mocha').afterEach;
var beforeEach = require('mocha').beforeEach;
var db = require('../../data/db');
var config = require('../config_test');
var r = require('rethinkdb');

describe('User Dao', function() {

    var instance;
    var sandbox;

    var createDefaultUser = function() {
        return {
            login: 'login',
            password: 'password',
            email: 'user@user.com',
            fullName: 'full name',
            roles: ['ROLE_1','ROLE_2','ROLE_3','ROLE_4'],
            org_id: ['org_id'],
            create_date: new Date()
        };
    };

    beforeEach(function () {
        instance = require('../../data/user_dao');
        sandbox = sinon.sandbox.create();
    });

    afterEach(function (done) {
        sandbox.restore();
        r.table('users').delete().run(db.global.connection, function(err, result) {
            db.close();
            done();
        });
    });

    it('should save a new user in the database', function (done) {
        // Given
        var user = createDefaultUser();

        db.init(config, function(err, connection) {
            db.global.connection = connection;
            // When
            instance.save(user, function (err, result) {
                // Then
                expect(err).to.be.null;

                done();
            });
        });
    });

    it('should retrieve all the users associated to a given organization ID', function(done) {
        // Given
        var user1 = createDefaultUser();

        var user2 = createDefaultUser();
        user2.login = 'login2';
        user2.org_id = ['another_org_id'];

        var orgId = 'org_id';
        var userArray = [user1, user2];

        db.init(config, function(err, connection) {
            db.global.connection = connection;

            instance.save(userArray, function(err, result) {
                expect(err).to.be.null;

                // When
                instance.findByOrgId(orgId, function (err, users) {
                    // Then
                    expect(err).to.be.null;
                    expect(users).to.be.a('array');
                    expect(users).to.have.lengthOf(1);
                    expect(users[0].org_id).to.contains(orgId);

                    done();
                });
            });

        });
    });

    it('should return true when a login already exists', function(done) {
        var user = createDefaultUser();

        db.init(config, function(err, connection) {
            db.global.connection = connection;

            instance.save(user, function(err, result) {
                expect(err).to.be.null;

                return instance.loginExists('login').then(function(exists) {
                    expect(Boolean(exists)).to.be.true;
                    done();
                });

            });
        });
    });

    it('should return a user found by login', function(done) {
        var user = createDefaultUser();

        db.init(config, function(err, connection) {
            db.global.connection = connection;

            instance.save(user, function(err, result) {
                expect(err).to.be.null;

                instance.findByLogin(user.login, function(err, user) {
                    expect(err).to.be.null;
                    expect(user).to.not.be.null;
                    done();
                });

            });
        });
    });

    it('should update user when saving if it contains an ID', function(done) {
        var user = createDefaultUser();

        db.init(config, function(err, connection) {
            db.global.connection = connection;

            instance.save(user, function(err, result) {
                expect(err).to.be.null;

                instance.findByLogin(user.login, function(err, user) {
                    expect(err).to.be.null;
                    expect(user).to.not.be.null;
                    expect(user.id).to.not.be.null;

                    user.roles[0] = 'UPDATED_ROLE';

                    instance.save(user, function(err, result) {
                        expect(err).to.be.null;

                        instance.findByLogin(user.login, function(err, user) {
                            expect(err).to.be.null;
                            expect(user).to.not.be.null;
                            expect(user.roles).to.contains('UPDATED_ROLE');

                            done();
                        });

                    });

                });

            });
        });
    });

    it('should find a user by id', function(done) {
        var user = createDefaultUser();

        db.init(config, function(err, connection) {
            db.global.connection = connection;

            instance.save(user, function (err, result) {
                expect(err).to.be.null;

                instance.findByLogin(user.login, function (err, user) {
                    expect(err).to.be.null;

                    instance.findById(user.id, function(err, user) {
                        expect(err).to.be.null;
                        expect(user).to.not.be.null;

                        done();
                    });
                });
            });
        });
    });

    it('should delete a user by id', function(done) {
        var user = createDefaultUser();

        db.init(config, function(err, connection) {
            db.global.connection = connection;

            instance.save(user, function (err, result) {
                expect(err).to.be.null;

                instance.findByLogin(user.login, function (err, user) {
                    expect(err).to.be.null;

                    instance.delete(user.id, function(err, result) {
                        expect(err).to.be.null;
                        console.log(result);
                        expect(result).to.be.equal('DELETED');

                        done();
                    });
                });
            });
        });
    });
});