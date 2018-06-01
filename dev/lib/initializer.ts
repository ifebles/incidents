import mongoClass from "./require/gomod-mongo";
import incidentsClass from "./controllers/incidents-controller";
import localitiesClass from "./controllers/localities-controller";
import mapperClass from "./require/gomod-mapper";
import { MapperApplicationTypes } from "./models/gomod-mapper-models";


/**
 * Hostname of the database server 
 */
const hostName = process.env.INCIDENTS_DB_SERVER_NAME || "localhost";
const fullURI = process.env.INCIDENTS_MONGO_URI;

const RETRY_LIMIT = +(process.env.INCIDENTS_RETRY_LIMIT || "10");
let retryAttempts = 0;

/**
 * Class' instace for my MongoDB handler  
 */
const gomodMongo = new mongoClass({
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
let incidents = new incidentsClass(gomodMongo, mongoCol_incidents, mongoCol_locality);
let localities = new localitiesClass(gomodMongo, mongoCol_locality);
// </Values_to_inject> //



/**
 * Mapper object to reference the whole project
 */
const mapper = new mapperClass(MapperApplicationTypes.WebAPI)
    .AddRoute('incidents', incidents.Incidents, { methods: "get,post" })
    .AddRoute('incidents/?{incidentId}/archive', incidents.ArchiveIncident, { methods: "post" })
    .AddRoute('localities', localities.Localities, { methods: "get" })
    .AddRoute('localities/?{localityId}', localities.Locality, { methods: "get" });

export { mapper }

/**
 * Preset the required values from the Database
 */
export function initializeDB () {
    gomodMongo.FindOne(mongoCol_locality)
        .then((obj) => {
            if (obj === null)
                gomodMongo.InsertMany(mongoCol_locality, [
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
            if (++retryAttempts < RETRY_LIMIT)
                setTimeout(initializeDB, 5000);
            else
                console.log(`Max retry attempts reached (${retryAttempts}). Exception:`, reason);
        });
};

exports.initializeDB = initializeDB;
