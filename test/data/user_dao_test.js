var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var describe = require("mocha").describe;
var it = require("mocha").it;
var sinon = require('sinon');
var proxyquire = require('proxyquire');
var afterEach = require('mocha').afterEach;
var beforeEach = require('mocha').beforeEach;
var db = require('../../data/db');
var config = require('../config_test');
var r = require('rethinkdb');

describe('User Dao', function() {

    var instance;
    var sandbox;

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
        var user = {
            id: 'id',
            login: 'login',
            password: 'password',
            email: 'user@user.com',
            fullName: 'full name',
            roles: 'ROLE_1,ROLE_2,ROLE_3,ROLE_4',
            org_id: 'org_id'
        };

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
        var user1 = {
            id: 'id',
            login: 'login',
            password: 'password',
            email: 'user@user.com',
            fullName: 'full name',
            roles: 'ROLE_1,ROLE_2,ROLE_3,ROLE_4',
            org_id: 'org_id'
        };
        var user2 = {
            id: 'id2',
            login: 'login2',
            password: 'password',
            email: 'user2@user2.com',
            fullName: 'full name 2',
            roles: 'ROLE_1,ROLE_2,ROLE_3,ROLE_4',
            org_id: 'another_org_id'
        };
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
                    expect(users[0].org_id).to.equal(orgId);

                    done();
                });
            });

        });
    });


});