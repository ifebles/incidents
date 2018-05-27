import * as chai from "chai";
import { describe, it } from "mocha";
let chaiHTTP = require("chai-http");

chai.use(chaiHTTP);
const expect = chai.expect;
const serverURL = "http://localhost:8000/";


describe("System response status", () => {
    it("/GET / -> Should return 404 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .get("/")
            .end((err: any, resp: any) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(404);

                done();
            });
    });

    it("/POST / -> Should return 404 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .post("/")
            .end((err: any, resp: any) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(404);

                done();
            });
    });

    it("/PUT / -> Should return 404 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .put("/")
            .end((err: any, resp: any) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(404);

                done();
            });
    });

    it("/GET /incidents/ -> Should return 200 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .get("/incidents")
            .end((err: any, resp: any) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(200);

                done();
            });
    });

    it("/POST /incidents/ -> Should return 200 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .post("/incidents")
            .end((err: any, resp: any) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(200);

                done();
            });
    });

    it("/PUT /incidents/ -> Should return 405 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .put("/incidents")
            .end((err: any, resp: any) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(405);

                done();
            });
    });

    it("/GET /incidents/{value}/archive/ -> Should return 405 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .get("/incidents/test/archive")
            .end((err: any, resp: any) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(405);

                done();
            });
    });

    it("/GET /incidents/{value}/archive/ -> Should return 200 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .post("/incidents/test/archive")
            .end((err: any, resp: any) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(200);

                done();
            });
    });

    it("/PUT /incidents/{value}/archive/ -> Should return 405 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .put("/incidents/test/archive")
            .end((err: any, resp: any) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(405);

                done();
            });
    });

    it("/GET /localities/ -> Should return 200 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .get("/localities")
            .end((err: any, resp: any) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(200);

                done();
            });
    });

    it("/POST /localities/ -> Should return 405 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .post("/localities")
            .end((err: any, resp: any) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(405);

                done();
            });
    });

    it("/PUT /localities/ -> Should return 405 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .put("/localities")
            .end((err: any, resp: any) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(405);

                done();
            });
    });

    it("/GET /localities/{value}/ -> Should return 200 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .get("/localities/testvalue")
            .end((err: any, resp: any) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(200);

                done();
            });
    });

    it("/POST /localities/{value}/ -> Should return 405 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .post("/localities/testvalue")
            .end((err: any, resp: any) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(405);

                done();
            });
    });

    it("/PUT /localities/{value}/ -> Should return 405 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .put("/localities/testvalue")
            .end((err: any, resp: any) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(405);

                done();
            });
    });
});

describe("Incidents module responses", () => {
    it("/GET /incidents/ -> Should return an array", (done: MochaDone) => {
        chai.request(serverURL)
            .get("/incidents")
            .end((err: any, resp: any) => {
                expect(err).to.be.null;
                expect(resp).to.not.be.null;
                expect(resp.body).to.not.be.null;
                expect(resp.body).to.be.instanceof(Array);
                expect(resp.body).length.to.be.gte(0);

                done();
            });
    });
});

describe("Localities module responses", () => {
    it("/GET /localities/ -> Should return an array", (done: MochaDone) => {
        chai.request(serverURL)
            .get("/localities")
            .end((err: any, resp: any) => {
                expect(err).to.be.null;
                expect(resp).to.not.be.null;
                expect(resp.body).to.not.be.null;
                expect(resp.body).to.be.instanceof(Array);
                expect(resp.body).length.to.be.gte(0).and.lte(4);

                done();
            });
    });
});