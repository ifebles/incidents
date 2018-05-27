
const gomodMapper = require('./require/gomod-mapper');
const gomodMongo = require("./require/gomod-mongo");
const controllers = require('./controllers');


/**
 * Hostname of the database server 
 */
const hostName = process.env.INCIDENTS_DB_SERVER_NAME || "localhost";

const fullURI = process.env.INCIDENTS_MONGO_URI;

/**
 * Class' instace for my MongoDB handler  
 */
const myMongo = new gomodMongo({
    // If assigned, it will be considered over the other configurations
    fullURI: fullURI,
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
exports.mapper = new gomodMapper("webapi")
    .addRoute('incidents', controllers.incidents, { methods: "get,post" })
    .addRoute('incidents/?{incidentId}/archive', controllers.archiveIncident, { methods: "post" })
    .addRoute('localities', controllers.localities, { methods: "get" })
    .addRoute('localities/?{localityId}', controllers.locality, { methods: "get" });


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
