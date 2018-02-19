
const myMapper = require('./require/myMapper');
const myMongoClass = require("./require/myMongo");
const controllers = require('./controllers');


/**
 * Hostname of the database server 
 */
const hostName = process.env.INCIDENTS_DB_SERVER_NAME !== undefined ? process.env.INCIDENTS_DB_SERVER_NAME: "localhost";


/**
 * Class' instace for my MongoDB handler  
 */
const myMongo = new myMongoClass({
    hostName: hostName,
    dbName: "incident"
});

// <MongoDB_collections> //
const mongoCol_locality = "dbLocality";
const mongoCol_incidents = "dbIncident";
// </MongoDB_collections> //


// <Values_to_inject> //
controllers.myMongo = myMongo;
controllers.mongoCol_locality = mongoCol_locality;
controllers.mongoCol_incidents = mongoCol_incidents;
// </Values_to_inject> //



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
    .addRoute('incidents', controllers.incidents, { methods: "get,post", handlesEndOfResponse: true })
    .addRoute('incidents/?{incidentId}/archive', controllers.archiveIncident, { methods: "post", handlesEndOfResponse: true })
    .addRoute('localities', controllers.localities, { methods: "get", handlesEndOfResponse: true })
    .addRoute('localities/?{localityId}', controllers.locality, { methods: "get", handlesEndOfResponse: true });


/**
 * Preset the required values from the Database
 */
var initializeDB = () => {
    myMongo.findOne(mongoCol_locality)
        .then((obj) => {
            if (obj === null)
                myMongo.insertMany(mongoCol_locality, [
                    { name: "Los Alcarrizos" },
                    { name: "Los Proceres" }
                ]).then((result) => {
                    console.log("Configured");
                }).catch((reason) => {
                    console.log(reason);
                });
            else
                console.log("Connected");
        })
        .catch((reason) => {
            console.log("Trying to reconnect...");
            setTimeout(initializeDB, 5000);
        });
};

exports.initializeDB = initializeDB;
