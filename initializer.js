
const MongoClient = require("mongodb").MongoClient;
const myMapper = require('./require/myMapper');
const controllers = require('./controllers');

const mongoUrl = "mongodb://localhost:27017/";
const mongoDBName = "incident";
const mongoCol_locality = "dbLocality";
const mongoCol_incidents = "dbIncident";


/**
 * Mapper object to reference the whole project
 */
exports.mapper = new myMapper()
    .setHeaderHandler((params) => {
        var status = 200;

        var methods = params.__context.currentMapping.methods;

        if (methods !== undefined && methods.indexOf(params.__context.request.method.toLowerCase()) === -1)
            status = 405; // Not Allowed

        params.__context.response.writeHead(status, {
            "Content-Type": "application/json"
        });
    })
    .addRoute('incidents', controllers.incidents, undefined, "get,post")
    .addRoute('incidents/?{incidentId}/archive', controllers.archiveIncident, undefined, "post")
    .addRoute('localities', controllers.localities, undefined, "get")
    .addRoute('localities/?{localityId}', controllers.locality, undefined, "get")


var initializeDB = () => {

    MongoClient.connect(mongoUrl, (err, db) => {
        if (err) throw err;
        
        var dbo = db.db(mongoDBName);

        dbo.collection(mongoCol_locality).findOne({}, (err, resp) => {
            if (err) throw err;

            if (resp === null)
                dbo.collection(mongoCol_locality).insertMany([
                    { name: "Los Alcarrizos" },
                    { name: "Los Proceres" }
                ], (err, resp) => {
                    // if (err) throw err;
                    if (err)
                    {
                        console.log("Trying to reconnect...");
                        setTimeout(initializeDB, 5000);
                        return;
                    }

                    console.log("configured");

                    db.close();
                })
        });
    });
};

exports.initializeDB = initializeDB;
