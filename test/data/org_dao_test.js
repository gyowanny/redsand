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
var _ = require('lodash');

describe('Org Dao', function() {

    var instance;
    var sandbox;

    var createDefaultOrg = function() {
        return {
            org_id: 'org_id',
            name: 'Organization Name',
            tokenExpiration: '24h',
            inactive: false
        };
    }

    beforeEach(function () {
        instance = require('../../data/org_dao');
        sandbox = sinon.sandbox.create();
    });

    afterEach(function (done) {
        sandbox.restore();
        r.table('users').delete().run(db.global.connection, function(err, result) {
            db.close();
            done();
        });
    });

    it('should create a new org configuration', function(done) {
        //Given
        var org = createDefaultOrg();

        //When
        db.init(config, function(err, connection) {
            db.global.connection = connection;
            // When
            instance.save(org, function (err, result) {
                // Then
                expect(err).to.be.null;

                done();
            });
        });
    });

    it('should find an existing org by org id', function(done) {
        //Given
        var org = createDefaultOrg();

        //When
        db.init(config, function(err, connection) {
            db.global.connection = connection;
            // When
            instance.save(org, function (err, result) {
                // Then
                expect(err).to.be.null;

                instance.findByOrgId('org_id', function(err, orgFound) {
                   expect(err).to.be.null;

                    delete orgFound.id;
                    expect(_.isEqual(orgFound, org)).to.be.true;

                    done();
                });

            });
        });
    });

    it('should return null when an org is not found by org id', function(done) {
        //Given

        //When
        db.init(config, function(err, connection) {
            db.global.connection = connection;
            // When
            instance.findByOrgId('no_org_id', function(err, orgFound) {
                expect(err).to.be.null;

                expect(orgFound).to.be.null;

                done();
            });

        });
    });
});