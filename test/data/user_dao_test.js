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
        }

        db.init(config, function(err, connection) {
            db.global.connection = connection;
            // When
            instance.save(user, function (err, result) {
                // Then
                expect(err).to.be.null;
                expect(result).to.be.equal('CREATED');

                done();
            });
        });
    });

});