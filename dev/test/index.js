import test from "ava"
import http from "ava-http"






test("/GET localities/", async t => {

    const failLocality = await http.get("http://localhost:8000/localities/" + Math.random());
    t.true(typeof failLocality === typeof {}, "The response is not an object");
    t.true(failLocality._id === undefined, "The response should return a non existing locality");
});


test("/POST incidents/ incidents/${incidentId}/archive/", async t => {

    const getLocs = await http.get("http://localhost:8000/localities");
    t.true(typeof getLocs === typeof [], "The response is not an object");
    t.true(getLocs.length >= 1, "The result must have at least 1 register to test with");

    const localityId = getLocs[0]._id;

    //////////////////////////////////

    const getLoc = await http.get("http://localhost:8000/localities/" + localityId);
    t.true(getLoc._id !== undefined, "The response should return an existing locality");

    //////////////////////////////////

    const form = { kind: "robbery", locationId: localityId, happenedAt: "2018-02-07" };
    const myPost = await http.post("http://localhost:8000/incidents", { form });
    t.true(myPost === true, "Response must be true");

    //////////////////////////////////

    const incidents = await http.get("http://localhost:8000/incidents");
    t.true(typeof incidents === typeof [], "The response is not an object");
    t.true(incidents.length >= 1, "The result must have at least 1 register to test with");

    //////////////////////////////////

    const archivePost = await http.post(`http://localhost:8000/incidents/${incidents[incidents.length - 1]._id}/archive/`);
    t.true(archivePost === true, "Response must be true");
})


test("/GET incidents/", async t => {

    var resp = await http.get("http://localhost:8000/incidents");
    t.true(typeof resp === typeof [], "The response is not an object");
});

