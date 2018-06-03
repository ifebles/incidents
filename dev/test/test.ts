import * as chai from "chai";
import { describe, it } from "mocha";
const chaiHTTP = require("chai-http");
import fetch from "node-fetch";


chai.use(chaiHTTP);
const expect = chai.expect;
const serverURL = "http://localhost:8000/";


describe("System response status", () => {
    it("/GET / -> Should return 404 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .get("/")
            .end((err, resp) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(404);

                done();
            });
    });

    it("/POST / -> Should return 404 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .post("/")
            .end((err, resp) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(404);

                done();
            });
    });

    it("/PUT / -> Should return 404 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .put("/")
            .end((err, resp) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(404);

                done();
            });
    });

    it("/GET /incidents/ -> Should return 200 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .get("/incidents")
            .end((err, resp) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(200);

                done();
            });
    });

    it("/POST /incidents/ -> Should return 200 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .post("/incidents")
            .end((err, resp) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(200);

                done();
            });
    });

    it("/PUT /incidents/ -> Should return 405 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .put("/incidents")
            .end((err, resp) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(405);

                done();
            });
    });

    it("/GET /incidents/{bad-value}/archive/ -> Should return 405 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .get("/incidents/test/archive")
            .end((err, resp) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(405);

                done();
            });
    });

    it("/POST /incidents/{bad-value}/archive/ -> Should return 200 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .post("/incidents/test/archive")
            .end((err, resp) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(200);

                done();
            });
    });

    it("/PUT /incidents/{bad-value}/archive/ -> Should return 405 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .put("/incidents/test/archive")
            .end((err, resp) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(405);

                done();
            });
    });

    it("/GET /localities/ -> Should return 200 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .get("/localities")
            .end((err, resp) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(200);

                done();
            });
    });

    it("/POST /localities/ -> Should return 405 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .post("/localities")
            .end((err, resp) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(405);

                done();
            });
    });

    it("/PUT /localities/ -> Should return 405 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .put("/localities")
            .end((err, resp) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(405);

                done();
            });
    });

    it("/GET /localities/{bad-value}/ -> Should return 200 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .get("/localities/testvalue")
            .end((err, resp) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(200);

                done();
            });
    });

    it("/POST /localities/{bad-value}/ -> Should return 405 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .post("/localities/testvalue")
            .end((err, resp) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(405);

                done();
            });
    });

    it("/PUT /localities/{bad-value}/ -> Should return 405 without exceptions", (done: MochaDone) => {
        chai.request(serverURL)
            .put("/localities/testvalue")
            .end((err, resp) => {
                expect(err).to.be.null;
                expect(resp).to.have.status(405);

                done();
            });
    });
});


describe("Localities module responses", () => {
    it("/GET /localities/ -> Should return an array", (done: MochaDone) => {
        chai.request(serverURL)
            .get("/localities")
            .end((err, resp) => {
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

    it("/GET /localities/{bad-value}/ -> Should return an empty object", (done: MochaDone) => {
        chai.request(serverURL)
            .get("/localities/badvalue")
            .end((err, resp) => {
                expect(err).to.be.null;
                expect(resp).to.not.be.null;
                expect(resp.body).to.not.be.null;
                expect(resp.body).to.be.instanceof(Object);
                expect(resp.body).to.be.empty;

                done();
            });
    });

    it("/GET /localities/{value}/ -> Should return a valid object", (done: MochaDone) => {
        fetch(serverURL + "/localities")
            .then((response) => response.json())
            .then((obj) => {
                chai.request(serverURL)
                .get(`/localities/${obj[0]._id}`)
                .end((err, resp) => {
                    expect(err).to.be.null;
                    expect(resp).to.not.be.null;
                    expect(resp.body).to.not.be.null;
                    expect(resp.body).to.be.instanceof(Object);
                    expect(resp.body).to.have.property("_id").to.be.equal(obj[0]._id);
                    expect(resp.body).to.have.property("name").and.not.be.null;

                    done();
                });
            })
            .catch((reason) => {
                console.log("Promise exception: ", reason);
                done();
            });
    });
});



describe("Incidents module responses", () => {
    it("/GET /incidents/ -> Should return an array", (done: MochaDone) => {
        chai.request(serverURL)
            .get("/incidents")
            .end((err, resp) => {
                expect(err).to.be.null;
                expect(resp).to.not.be.null;
                expect(resp.body).to.not.be.null;
                expect(resp.body).to.be.instanceof(Array);
                expect(resp.body).length.to.be.at.least(0);

                if (resp.body.length > 0)
                {
                    expect(resp.body[0]).to.have.property("_id").to.not.be.null;
                    expect(resp.body[0]).to.have.property("kind").to.not.be.null;
                    expect(resp.body[0]).to.have.property("locationId").to.not.be.null;
                    expect(resp.body[0]).to.have.property("happenedAt").to.not.be.null;
                    expect(resp.body[0]).to.have.property("isArchived").to.not.be.null;
                }

                done();
            });
    });

    it("/POST /incidents/ (without sending parameters) -> Should return \"false\"", (done: MochaDone) => {
        chai.request(serverURL)
            .post("/incidents")
            .end((err, resp) => {
                expect(err).to.be.null;
                expect(resp).to.not.be.null;
                expect(resp.body).to.not.be.null;
                chai.assert.isTrue(typeof resp.body === typeof true)
                expect(resp.body).to.be.equal(false);

                done();
            });
    });

    it("/POST /incidents/{bad-value}/archive -> Should return \"false\"", (done: MochaDone) => {
        chai.request(serverURL)
            .post("/incidents/badvalue/archive")
            .end((err, resp) => {
                expect(err).to.be.null;
                expect(resp).to.not.be.null;
                expect(resp.body).to.not.be.null;
                chai.assert.isTrue(typeof resp.body === typeof true)
                expect(resp.body).to.be.equal(false);

                done();
            });
    });

    it("/POST /incidents/ (with the correct parameters) -> Should insert a new incident", (done: MochaDone) => {
        fetch(serverURL + "/localities")
            .then((response) => response.json())
            .then((obj) => {
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
                .end((err, resp) => {
                    expect(err).to.be.null;
                    expect(resp).to.not.be.null;
                    expect(resp.body).to.be.true;

                    done();
                });
            })
            .catch((reason) => {
                console.log("Promise exception: ", reason);
                done();
            });
    });

    it("/GET /incidents/ -> Should return an array containing the inserted registry", (done: MochaDone) => {
        chai.request(serverURL)
            .get("/incidents")
            .end((err, resp) => {
                expect(err).to.be.null;
                expect(resp).to.not.be.null;
                expect(resp.body).to.not.be.null;
                expect(resp.body).to.be.instanceof(Array);
                expect(resp.body).length.to.be.gte(0);

                let responseExpected = (resp.body as Array<IIncidentsReponseModel>).filter((incident) => {
                    let incidentDate = new Date(incident.happenedAt);
                    
                    return incidentDate.getUTCDate() === 31
                        && incidentDate.getUTCMonth() === 5 - 1
                        && incidentDate.getUTCFullYear() === 2018
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

    it("/POST /incidents/{value}/archive/ -> Should archive an incident", (done: MochaDone) => {
        fetch(serverURL + "/incidents")
            .then((response) => response.json())
            .then((obj) => {
                chai.request(serverURL)
                .post(`/incidents/${obj[obj.length - 1]._id}/archive`)
                .end((err, resp) => {
                    expect(err).to.be.null;
                    expect(resp).to.not.be.null;
                    expect(resp.body).to.be.true;

                    done();
                });
            })
            .catch((reason) => {
                console.log("Promise exception: ", reason);
                done();
            });
    });
});

interface IIncidentsReponseModel
{
    id_: string;
    kind: string;
    locationId: string;
    happenedAt: string;
    isArchived: boolean
}
