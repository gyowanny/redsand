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
    };

    beforeEach(function () {
        instance = require('../../data/org_dao');
        sandbox = sinon.sandbox.create();
    });

    afterEach(function (done) {
        sandbox.restore();
        r.table('orgs').delete().run(db.global.connection, function(err, result) {
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

    it('should return true when an org_id already exists', function(done) {
        var org = createDefaultOrg();

        db.init(config, function(err, connection) {
            db.global.connection = connection;

            instance.save(org, function(err, result) {
                expect(err).to.be.null;

                return instance.orgIdExists(org.org_id).then(function(exists) {
                    expect(Boolean(exists)).to.be.true;
                    done();
                });

            });
        });
    });

    it('should find an org by ID', function(done) {
        var org = createDefaultOrg();

        db.init(config, function(err, connection) {
            db.global.connection = connection;

            instance.save(org, function(err, result) {
                expect(err).to.be.null;

                instance.findByOrgId(org.org_id, function(err, orgFound) {
                    expect(err).to.be.null;
                    expect(orgFound).to.not.be.null;

                    instance.findById(orgFound.id, function(err, orgFoundById) {
                        expect(err).to.be.null;
                        expect(orgFoundById).to.not.be.null;

                        done();
                    });
                });
            });
        });
    });

    it('should update org when saving if it contains an ID', function(done) {
        var org = createDefaultOrg();

        db.init(config, function(err, connection) {
            db.global.connection = connection;

            instance.save(org, function(err, result) {
                expect(err).to.be.null;

                instance.findByOrgId(org.org_id, function(err, org) {
                    expect(err).to.be.null;
                    expect(org).to.not.be.null;
                    expect(org.id).to.not.be.null;

                    org.tokenExpiration = '10h';

                    instance.save(org, function(err, result) {
                        expect(err).to.be.null;

                        instance.findByOrgId(org.org_id, function(err, org) {
                            expect(err).to.be.null;
                            expect(org).to.not.be.null;
                            expect(org.tokenExpiration).to.be.equal('10h');

                            done();
                        });

                    });

                });

            });
        });
    });

    it('should delete an org by id', function(done) {
        var org = createDefaultOrg();

        db.init(config, function(err, connection) {
            db.global.connection = connection;

            instance.save(org, function (err, result) {
                expect(err).to.be.null;

                instance.findByOrgId(org.org_id, function (err, org) {
                    expect(err).to.be.null;

                    instance.delete(org.id, function(err, result) {
                        expect(err).to.be.null;
                        console.log(result);
                        expect(result).to.be.equal('DELETED');

                        done();
                    });
                });
            });
        });
    });

    it('should return all existing orgs', function(done) {
        var org = createDefaultOrg();

        db.init(config, function(err, connection) {
            db.global.connection = connection;

            instance.save(org, function (err, result) {
                expect(err).to.be.null;

                instance.getAll(function (err, orgList) {
                    expect(err).to.be.null;

                    expect(orgList).to.not.be.null;
                    expect(orgList).to.have.lengthOf(1);

                    done();
                });
            });
        });
    });

});