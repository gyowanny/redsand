var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var describe = require("mocha").describe;
var it = require("mocha").it;
var afterEach = require("mocha").afterEach;
var beforeEach = require("mocha").beforeEach;
var config = require("../../../config_test.js");
var MockExpressRequest = require('mock-express-request');
var db = require("../../../../data/db.js");
var r = require('rethinkdb');
var orgDao = require("../../../../data/org_dao.js");
var _ = require('lodash');

describe('ADMIN - Delete org route', function() {

    var instance;

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
        instance = require('../../../../route/admin/org/delete_org_route');
        db.init(config, function(err, connection) {
            db.global.connection = connection;
            done();
        });
    });

    afterEach(function (done) {
        r.table('orgs').delete().run(db.global.connection, function(err, result) {
            done();
        });
    });

    it('should delete an existing org', function(done) {

        createOrg(function(result) {
            orgDao.findByOrgId('org_id', function(err, orgCreated) {


                var request = new MockExpressRequest({
                    method: 'DELETE',
                    url: 'url',
                    headers: {
                        'Accept': 'application/json'
                    },
                    params: {
                        id: orgCreated.id
                    }
                });
                var response = {
                    actualStatus: 200,
                    status: function(st) {
                        this.actualStatus = st;
                        return this;
                    },
                    json: function(response) {
                        expect(this.actualStatus).to.be.equal(200);
                        expect(response.success).to.be.true;
                        expect(response.message).to.be.equal('DELETED');

                        orgDao.findById(orgCreated.id, function(err, orgFound) {
                            expect(orgFound).to.be.null;

                            done();
                        });
                    }
                };

                //When
                instance(request, response);
            });
        });
    });

    it('should return error for non-existing ID', function(done) {
        var request = new MockExpressRequest({
            method: 'DELETE',
            url: 'url',
            headers: {
                'Accept': 'application/json'
            },
            params: {
                id: 'invalid'
            }
        });
        var response = {
            actualStatus: 200,
            status: function(st) {
                this.actualStatus = st;
                return this;
            },
            json: function(response) {
                expect(this.actualStatus).to.be.equal(400);
                expect(response.success).to.be.false;
                expect(response.message).to.be.equal('NOT_FOUND');

                done();
            }
        };

        //When
        instance(request, response);
    });

});