"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var mocha_1 = require("mocha");
var chaiHTTP = require("chai-http");
var node_fetch_1 = require("node-fetch");
chai.use(chaiHTTP);
var expect = chai.expect;
var serverURL = "http://localhost:8000/";
mocha_1.describe("System response status", function () {
    mocha_1.it("/GET / -> Should return 404 without exceptions", function (done) {
        chai.request(serverURL)
            .get("/")
            .end(function (err, resp) {
            expect(err).to.be.null;
            expect(resp).to.have.status(404);
            done();
        });
    });
    mocha_1.it("/POST / -> Should return 404 without exceptions", function (done) {
        chai.request(serverURL)
            .post("/")
            .end(function (err, resp) {
            expect(err).to.be.null;
            expect(resp).to.have.status(404);
            done();
        });
    });
    mocha_1.it("/PUT / -> Should return 404 without exceptions", function (done) {
        chai.request(serverURL)
            .put("/")
            .end(function (err, resp) {
            expect(err).to.be.null;
            expect(resp).to.have.status(404);
            done();
        });
    });
    mocha_1.it("/GET /incidents/ -> Should return 200 without exceptions", function (done) {
        chai.request(serverURL)
            .get("/incidents")
            .end(function (err, resp) {
            expect(err).to.be.null;
            expect(resp).to.have.status(200);
            done();
        });
    });
    mocha_1.it("/POST /incidents/ -> Should return 200 without exceptions", function (done) {
        chai.request(serverURL)
            .post("/incidents")
            .end(function (err, resp) {
            expect(err).to.be.null;
            expect(resp).to.have.status(200);
            done();
        });
    });
    mocha_1.it("/PUT /incidents/ -> Should return 405 without exceptions", function (done) {
        chai.request(serverURL)
            .put("/incidents")
            .end(function (err, resp) {
            expect(err).to.be.null;
            expect(resp).to.have.status(405);
            done();
        });
    });
    mocha_1.it("/GET /incidents/{value}/archive/ -> Should return 405 without exceptions", function (done) {
        chai.request(serverURL)
            .get("/incidents/test/archive")
            .end(function (err, resp) {
            expect(err).to.be.null;
            expect(resp).to.have.status(405);
            done();
        });
    });
    mocha_1.it("/POST /incidents/{value}/archive/ -> Should return 200 without exceptions", function (done) {
        chai.request(serverURL)
            .post("/incidents/test/archive")
            .end(function (err, resp) {
            expect(err).to.be.null;
            expect(resp).to.have.status(200);
            done();
        });
    });
    mocha_1.it("/PUT /incidents/{value}/archive/ -> Should return 405 without exceptions", function (done) {
        chai.request(serverURL)
            .put("/incidents/test/archive")
            .end(function (err, resp) {
            expect(err).to.be.null;
            expect(resp).to.have.status(405);
            done();
        });
    });
    mocha_1.it("/GET /localities/ -> Should return 200 without exceptions", function (done) {
        chai.request(serverURL)
            .get("/localities")
            .end(function (err, resp) {
            expect(err).to.be.null;
            expect(resp).to.have.status(200);
            done();
        });
    });
    mocha_1.it("/POST /localities/ -> Should return 405 without exceptions", function (done) {
        chai.request(serverURL)
            .post("/localities")
            .end(function (err, resp) {
            expect(err).to.be.null;
            expect(resp).to.have.status(405);
            done();
        });
    });
    mocha_1.it("/PUT /localities/ -> Should return 405 without exceptions", function (done) {
        chai.request(serverURL)
            .put("/localities")
            .end(function (err, resp) {
            expect(err).to.be.null;
            expect(resp).to.have.status(405);
            done();
        });
    });
    mocha_1.it("/GET /localities/{value}/ -> Should return 200 without exceptions", function (done) {
        chai.request(serverURL)
            .get("/localities/testvalue")
            .end(function (err, resp) {
            expect(err).to.be.null;
            expect(resp).to.have.status(200);
            done();
        });
    });
    mocha_1.it("/POST /localities/{value}/ -> Should return 405 without exceptions", function (done) {
        chai.request(serverURL)
            .post("/localities/testvalue")
            .end(function (err, resp) {
            expect(err).to.be.null;
            expect(resp).to.have.status(405);
            done();
        });
    });
    mocha_1.it("/PUT /localities/{value}/ -> Should return 405 without exceptions", function (done) {
        chai.request(serverURL)
            .put("/localities/testvalue")
            .end(function (err, resp) {
            expect(err).to.be.null;
            expect(resp).to.have.status(405);
            done();
        });
    });
});
mocha_1.describe("Localities module responses", function () {
    mocha_1.it("/GET /localities/ -> Should return an array", function (done) {
        chai.request(serverURL)
            .get("/localities")
            .end(function (err, resp) {
            expect(err).to.be.null;
            expect(resp).to.not.be.null;
            expect(resp.body).to.not.be.null;
            expect(resp.body).to.be.instanceof(Array);
            expect(resp.body).length.to.be.gte(0).and.lte(4);
            expect(resp.body[0]).to.have.property("_id").and.not.be.null;
            expect(resp.body[0]).to.have.property("name").and.not.be.null;
            done();
        });
    });
    mocha_1.it("/GET /localities/{value}/ -> Should return a valid object", function (done) {
        node_fetch_1.default(serverURL + "/localities")
            .then(function (response) { return response.json(); })
            .then(function (obj) {
            chai.request(serverURL)
                .get("/localities/" + obj[0]._id)
                .end(function (err, resp) {
                expect(err).to.be.null;
                expect(resp).to.not.be.null;
                expect(resp.body).to.not.be.null;
                expect(resp.body).to.have.property("_id").to.be.equal(obj[0]._id);
                expect(resp.body).to.have.property("name").and.not.be.null;
                done();
            });
        })
            .catch(function (reason) {
            console.log("Promise exception: ", reason);
            done();
        });
    });
});
mocha_1.describe("Incidents module responses", function () {
    mocha_1.it("/GET /incidents/ -> Should return an array", function (done) {
        chai.request(serverURL)
            .get("/incidents")
            .end(function (err, resp) {
            expect(err).to.be.null;
            expect(resp).to.not.be.null;
            // expect(resp.body).to.not.be.null; -- It can be null
            expect(resp.body).to.be.instanceof(Array);
            expect(resp.body).length.to.be.gte(0);
            expect(resp.body[0]).to.have.property("_id").to.not.be.null;
            expect(resp.body[0]).to.have.property("kind").to.not.be.null;
            expect(resp.body[0]).to.have.property("locationId").to.not.be.null;
            expect(resp.body[0]).to.have.property("happenedAt").to.not.be.null;
            expect(resp.body[0]).to.have.property("isArchived").to.not.be.null;
            done();
        });
    });
    mocha_1.it("/POST /incidents/ -> Should return \"false\"", function (done) {
        chai.request(serverURL)
            .post("/incidents")
            .end(function (err, resp) {
            expect(err).to.be.null;
            expect(resp).to.not.be.null;
            expect(resp.body).to.not.be.null;
            chai.assert.isTrue(typeof resp.body === typeof true);
            expect(resp.body).to.be.equal(false);
            done();
        });
    });
    mocha_1.it("/POST /incidents/ -> Should insert a new incident", function (done) {
        node_fetch_1.default(serverURL + "/localities")
            .then(function (response) { return response.json(); })
            .then(function (obj) {
            chai.request(serverURL)
                .post("/incidents")
                .set({
                "Content-Type": "application/x-www-form-urlencoded"
            })
                .send({
                kind: "TRAFFIC_ACCIDENT",
                locationId: obj[0]._id,
                happenedAt: "2018-05-31"
            })
                .end(function (err, resp) {
                expect(err).to.be.null;
                expect(resp).to.not.be.null;
                expect(resp.body).to.be.true;
                done();
            });
        })
            .catch(function (reason) {
            console.log("Promise exception: ", reason);
            done();
        });
    });
    mocha_1.it("/GET /incidents/ -> Should return an array containing the inserted registry", function (done) {
        chai.request(serverURL)
            .get("/incidents")
            .end(function (err, resp) {
            expect(err).to.be.null;
            expect(resp).to.not.be.null;
            expect(resp.body).to.not.be.null;
            expect(resp.body).to.be.instanceof(Array);
            expect(resp.body).length.to.be.gte(0);
            var responseExpected = resp.body.filter(function (incident) {
                var incidentDate = new Date(incident.happenedAt);
                return incidentDate.getDate() === 31
                    && incidentDate.getMonth() === 5 - 1
                    && incidentDate.getFullYear() === 2018;
            });
            expect(responseExpected).to.be.instanceOf(Array);
            expect(responseExpected).to.have.length(1);
            expect(responseExpected[0]).to.have.property("_id").to.not.be.null;
            expect(responseExpected[0]).to.have.property("locationId").to.not.be.null;
            expect(responseExpected[0]).to.have.property("kind").to.be.equal("TRAFFIC_ACCIDENT");
            expect(responseExpected[0]).to.have.property("isArchived").to.be.equal(false);
            expect(responseExpected[0]).to.have.property("happenedAt").to.be.equal(resp.body[resp.body.length - 1].happenedAt);
            done();
        });
    });
    mocha_1.it("/POST /incidents/{value}/archive/ -> Should archive an incident", function (done) {
        node_fetch_1.default(serverURL + "/incidents")
            .then(function (response) { return response.json(); })
            .then(function (obj) {
            chai.request(serverURL)
                .post("/incidents/" + obj[obj.length - 1]._id + "/archive")
                .end(function (err, resp) {
                expect(err).to.be.null;
                expect(resp).to.not.be.null;
                expect(resp.body).to.be.true;
                done();
            });
        })
            .catch(function (reason) {
            console.log("Promise exception: ", reason);
            done();
        });
    });
});
