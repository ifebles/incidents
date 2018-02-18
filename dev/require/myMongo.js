
const MongoClient = require("mongodb").MongoClient;


/**
 * Object referencing the current instance
 * @type {myMongo}
 */
var self;

/**
 * Full connection string
 * @type {string}
 */
var fullURI;


/**
 * Host name
 * @type {string}
 */
var hostName;

/**
 * Port number
 * @type {number}
 */
var port;


/**
 * Database name
 * @type {string}
 */
var dbName;



/**
 * Allowed setting properties
 */
const allowedSettings = [
    "fullURI",
    "hostName",
    "port",
    "dbName"
];



/**
 * Initialize myMongo class
 * @param {{fullURI: ?string, hostName: ?string, port: ?number, dbName: ?string}} settings Settings to preset for the upcomming connections
 */
function myMongo(settings)
{
    switch(typeof settings)
    {
        case "undefined":
            hostName = "localhost";
            port = 27017;
        break;

        case "object":
            var atLeastOne = false;

            for (var a in settings)
            {
                atLeastOne = true;

                if (allowedSettings.indexOf(a) === -1)
                    throw new Error(`Unrecognized setting: "${a}"`);
            }


            if (!atLeastOne)
                throw new Error("No setting found");
            
            fullURI = settings.fullURI;
            hostName = settings.hostName ? settings.hostName: "localhost";
            port = settings.port ? settings.port: 27017;
            dbName = settings.dbName;
        break;

        default:
            throw new Error("An object was expected as the first parameter (settings). \"" + typeof settings + "\" given.");
    }

    self = this;
    this.mongo = MongoClient;
}


/**
 * Set the host name to use on upcomming connections
 * @param {string} host Host name
 */
myMongo.prototype.setHostName = (host) => {
    if (typeof host !== "string")
        throw new Error(`A "string" was expected. "${typeof host}" given.`);

    hostName = host;

    return self;
};


/**
 * Set the port number to use on upcomming connections
 * @param {number} portNumber Port number
 */
myMongo.prototype.setPort = (portNumber) => {
    if (typeof portNumber !== "number")
        throw new Error(`A "number" was expected. "${typeof portNumber}" given.`);

    port = portNumber;

    return self;
};


/**
 * Set the database name to use on upcomming connections
 * @param {string} databaseName Database name
 */
myMongo.prototype.setDbName = (databaseName) => {
    if (typeof databaseName !== "string")
        throw new Error(`A "string" was expected. "${typeof databaseName}" given.`);

    dbName = databaseName;

    return self;
};


/**
 * Set the connection string to use on upcomming connections
 * @param {string} connectionString Host name
 */
myMongo.prototype.setURI = (connectionString) => {
    if (typeof connectionString !== "string")
        throw new Error(`A "string" was expected. "${typeof connectionString}" given.`);

    fullURI = connectionString;

    return self;
};


/**
 * Create a MongoDB connection
 */
myMongo.prototype.connect = () => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(fullURI ? fullURI: `mongodb://${hostName}:${port}/${dbName ? dbName: ""}`, (err, con) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(con);
          });
    });
}



/**
 * Insert a document into the specified collection
 * @param {string} collectionName Collection name
 * @param {{}} document Document (row) to insert
 */
myMongo.prototype.insertOne = (collectionName, document) => {
    // Method created to keep up with the convention (one - many)
    return self.insertMany(collectionName, [document]);
};


/**
 * Insert a document into the specified collection
 * @param {string} collectionName Collection name
 * @param {{}} document Document (row) to insert
 */
myMongo.prototype.insert = (collectionName, document) => {
    return self.insertMany(collectionName, [document]);
};


/**
 * Insert one or more documents into the specified collection
 * @param {string} collectionName Collection name
 * @param {...{}} documents Documents (rows) to insert
 */
myMongo.prototype.insertMany = (collectionName, documents) => {
    if (typeof collectionName !== "string")
        throw new Error(`A string was expected for the first parameter (collectionName). "${typeof collectionName}"  given.`);

    if (typeof documents !== "object")
        throw new Error(`An object was expected for the second parameter (documents). "${typeof documents}"  given.`);

    return new Promise((resolve, reject) => {
        if (dbName === undefined)
            throw new Error("No database name specified.");

        self.connect()
            .then((obj) => {
                var dbo = obj.db(dbName);

                dbo.collection(collectionName).insert(documents, (err, response) => {
                    obj.close();

                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(response);
                });
            })
            .catch((reason) => {
                reject(reason);
            });
    });
};


/**
 * Find the first found document mathing the given filter
 * @param {string} collectionName Collection name
 * @param {{}} filter Filter for the search
 * @param {{}} toShow Fields to show in the result
 */
myMongo.prototype.findOne = (collectionName, filter, toShow) => {
    return new Promise((resolve, reject) => {
        self.find(collectionName, filter)
            .then((obj) => {
                resolve(obj[0] || null);
            })
            .catch((reason) => {
                reject(reason);
            });
    });
};


/**
 * Find the documents mathing the given filter
 * @param {string} collectionName Collection name
 * @param {...{}} filter Documents (rows) to insert
 * @param {{}} toShow Fields to show in the result
 */
myMongo.prototype.find = (collectionName, filter, toShow) => {
    if (typeof collectionName !== "string")
        throw new Error(`A string was expected for the first parameter (collectionName). "${typeof collectionName}"  given.`);

    if (filter !== undefined && typeof filter !== "object")
        throw new Error(`An object was expected for the second parameter (filter). "${typeof filter}"  given.`);

    if (toShow !== undefined && typeof toShow !== 'object')
        throw new Error(`An object was expected for the third parameter (toShow). "${typeof toShow}"  given.`);

    if (filter)
        for (var a in filter)
            if (a === "_id" && typeof filter[a] === "string")
                try {
                    filter[a] = MongoClient.connect.ObjectId(filter[a]);
                }
                catch (ex) { }

    return new Promise((resolve, reject) => {
        if (dbName === undefined)
            throw new Error("No database name specified.");

        self.connect()
            .then((obj) => {
                var dbo = obj.db(dbName);

                dbo.collection(collectionName).find(filter || {}, toShow).toArray((err, response) => {
                    obj.close();

                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve(response);
                });
            })
            .catch((reason) => {
                reject(reason);
            });
    });
};



/**
 * Update just one document matching the given filter
 * @param {string} collectionName Collection name
 * @param {{}} filter Filter the documents to update
 * @param {{}} toUpdate Values to set
 */
myMongo.prototype.updateOne = (collectionName, filter, toUpdate) => {
    return update(collectionName, filter, toUpdate, "one");
};



/**
 * Update all documents matching the given filter
 * @param {string} collectionName Collection name
 * @param {{}} filter Filter the documents to update
 * @param {{}} toUpdate Values to set
 */
myMongo.prototype.updateMany = (collectionName, filter, toUpdate) => {
    return update(collectionName, filter, toUpdate, "many");
};



/**
 * Update all documents or just one matching the given filter depending on the specified mode
 * @param {string} collectionName Collection name
 * @param {{}} filter Filter the documents to update
 * @param {{}} toUpdate Values to set
 * @param {string} mode Update mode ("one"/"many")
 */
var update = (collectionName, filter, toUpdate, mode) => {
    if (typeof collectionName !== "string")
        throw new Error(`A string was expected for the first parameter (collectionName). "${typeof collectionName}"  given.`);

    if (typeof filter !== "object")
        throw new Error(`An object was expected for the second parameter (filter). "${typeof filter}"  given.`);

    if (typeof toUpdate !== 'object')
        throw new Error(`An object was expected for the third parameter (toUpdate). "${typeof toUpdate}"  given.`);

    for (var a in filter)
        if (a === "_id" && typeof filter[a] === "string")
            try {
                filter[a] = MongoClient.connect.ObjectId(filter[a]);
            }
            catch (ex) { }

    return new Promise((resolve, reject) => {
        if (dbName === undefined)
            throw new Error("No database name specified.");

        self.connect()
            .then((obj) => {
                var dbo = obj.db(dbName);

                if (mode === "one")
                    dbo.collection(collectionName).updateOne(filter, toUpdate, (err, result) => {
                        obj.close();

                        if (err) reject(err);

                        resolve(result);
                    });
                else if (mode === "many")
                    dbo.collection(collectionName).updateMany(filter, toUpdate, (err, result) => {
                        obj.close();

                        if (err) reject(err);

                        resolve(result);
                    });
                else
                    reject(new Error("Invalid update mode"));
            })
            .catch((reason) => {
                reject(reason);
            });
    });
};



/**
 * Delete just one document matching the given filter
 * @param {string} collectionName Collection name
 * @param {{}} filter Filter the documents to update
 * @param {{}} toUpdate Values to set
 */
myMongo.prototype.deleteOne = () => {
    return deleteDocument(collectionName, filter, toUpdate, "one");
};



/**
 * Delete all documents matching the given filter
 * @param {string} collectionName Collection name
 * @param {{}} filter Filter the documents to update
 * @param {{}} toUpdate Values to set
 */
myMongo.prototype.deleteMany = (collectionName, filter, toUpdate) => {
    return deleteDocument(collectionName, filter, toUpdate, "many");
};




/**
 * Delete all documents or just one matching the given filter depending on the specified mode
 * @param {string} collectionName Collection name
 * @param {{}} filter Filter the documents to delete
 * @param {string} mode Update mode ("one"/"many")
 */
var deleteDocument = (collectionName, filter, mode) => {
    if (typeof collectionName !== "string")
        throw new Error(`A string was expected for the first parameter (collectionName). "${typeof collectionName}"  given.`);

    if (typeof filter !== "object")
        throw new Error(`An object was expected for the second parameter (filter). "${typeof filter}"  given.`);

    for (var a in filter)
        if (a === "_id" && typeof filter[a] === "string")
            try {
                filter[a] = MongoClient.connect.ObjectId(filter[a]);
            }
            catch (ex) { }

    return new Promise((resolve, reject) => {
        if (dbName === undefined)
            throw new Error("No database name specified.");

        self.connect
            .then((obj) => {
                var dbo = obj.db(dbName);

                if (mode === "one")
                    dbo.collection(collectionName).deleteOne(filter, (err, result) => {
                        obj.close();

                        if (err) reject(err);

                        resolve(result);
                    });
                else if (mode === "many")
                    dbo.collection(collectionName).deleteMany(filter, (err, result) => {
                        obj.close();

                        if (err) reject(err);

                        resolve(result);
                    });
                else
                    reject(new Error("Invalid update mode"));
            })
            .catch((reason) => {
                reject(reason);
            });
    });
};



module.exports = myMongo;