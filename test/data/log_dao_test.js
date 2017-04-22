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

describe('Log Dao', function() {

    var instance;
    var sandbox;

    var createDefaultLogEntry = function() {
        return {
            subject: 'subject',
            org_id: 'org_id',
            data: {
                name: 'name'
            },
            timestamp: new Date().toISOString()
        };
    };

    beforeEach(function () {
        instance = require('../../data/log_dao');
        sandbox = sinon.sandbox.create();
    });

    afterEach(function (done) {
        sandbox.restore();
        r.table('logs').delete().run(db.global.connection, function(err, result) {
            db.close();
            done();
        });
    });

    it('should create a new log entry', function(done) {
        //Given
        var log = createDefaultLogEntry();

        //When
        db.init(config, function(err, connection) {
            db.global.connection = connection;
            // When
            instance.save(log, function (err, result) {
                // Then
                expect(err).to.be.null;
                expect(result).to.be.equal('CREATED');

                instance.findBySubjectAndOrgId(log.subject, log.org_id, function(err, entries) {
                    expect(err).to.be.null;
                    expect(entries).to.not.be.null;
                    expect(entries).to.have.lengthOf(1);
                    done();
                });
            });
        });
    });

});