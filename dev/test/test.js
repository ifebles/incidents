"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var mocha_1 = require("mocha");
var chaiHTTP = require("chai-http");
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
    mocha_1.it("/GET /incidents/{value}/archive/ -> Should return 200 without exceptions", function (done) {
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
mocha_1.describe("Incidents module responses", function () {
    mocha_1.it("/GET /incidents/ -> Should return an array", function (done) {
        chai.request(serverURL)
            .get("/incidents")
            .end(function (err, resp) {
            expect(err).to.be.null;
            expect(resp).to.not.be.null;
            expect(resp.body).to.not.be.null;
            expect(resp.body).to.be.instanceof(Array);
            expect(resp.body).length.to.be.gte(0);
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
            done();
        });
    });
});
