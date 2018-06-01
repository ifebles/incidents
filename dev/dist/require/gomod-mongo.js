"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const myMongoClient = require("mongodb").MongoClient;
const mongodb_1 = require("mongodb");
class GomodMongo {
    constructor(settings) {
        /**
         * Set the host name to use on upcomming connections
         * @param host Host name
         */
        this.SetHostName = (host) => {
            this.settings.hostName = host;
            return this;
        };
        /**
         * Set the port number to use on upcomming connections
         * @param portNumber Port number
         */
        this.SetPort = (portNumber) => {
            this.settings.port = portNumber;
            return this;
        };
        /**
         * Set the database name to use on upcomming connections
         * @param databaseName Database name
         */
        this.SetDbName = (databaseName) => {
            this.settings.dbName = databaseName;
            return this;
        };
        /**
         * Set the connection string to use on upcomming connections
         * @param connectionString Host name
         */
        this.SetURI = (connectionString) => {
            this.settings.fullURI = connectionString;
            return this;
        };
        /**
         * Create a MongoDB connection
         */
        this.Connect = () => {
            return new Promise((resolve, reject) => {
                mongodb_1.MongoClient.connect(this.settings.fullURI ? this.settings.fullURI : `mongodb://${this.settings.hostName}:${this.settings.port}/${this.settings.dbName ? this.settings.dbName : ""}`, (err, con) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(con);
                });
            });
        };
        /**
         * Insert a document into the specified collection
         * @param collectionName Collection name
         * @param document Document (row) to insert
         */
        this.InsertOne = (collectionName, document) => {
            // Method created to keep up with the convention (one - many)
            return this.InsertMany(collectionName, [document]);
        };
        /**
         * Insert a document into the specified collection
         * @param collectionName Collection name
         * @param document Document (row) to insert
         */
        this.Insert = (collectionName, document) => {
            return this.InsertMany(collectionName, [document]);
        };
        /**
         * Insert one or more documents into the specified collection
         * @param collectionName Collection name
         * @param documents Documents (rows) to insert
         */
        this.InsertMany = (collectionName, documents) => {
            return new Promise((resolve, reject) => {
                if (this.settings.dbName === undefined)
                    throw new Error("No database name specified.");
                this.Connect()
                    .then((obj) => {
                    let dbo = obj.db(this.settings.dbName);
                    dbo.collection(collectionName).insertMany(documents, (err, response) => {
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
         * @param collectionName Collection name
         * @param filter Filter for the search
         * @param toShow Fields to show in the result
         */
        this.FindOne = (collectionName, filter = {}, toShow) => {
            return new Promise((resolve, reject) => {
                this.Find(collectionName, filter, toShow)
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
         * @param collectionName Collection name
         * @param filter Filter for the search
         * @param toShow Fields to show in the result
         */
        this.FindMany = (collectionName, filter = {}, toShow) => {
            // Method created to keep up with the convention (one - many)
            return this.Find(collectionName, filter, toShow);
        };
        /**
         * Find the documents mathing the given filter
         * @param collectionName Collection name
         * @param filter Filter for the search
         * @param toShow Fields to show in the result
         */
        this.Find = (collectionName, filter = {}, toShow) => {
            if (filter)
                for (var a in filter)
                    if (a === "_id" && typeof filter[a] === "string")
                        try {
                            filter[a] = mongodb_1.MongoClient.connect.ObjectId(filter[a]);
                        }
                        catch (ex) { }
            return new Promise((resolve, reject) => {
                if (this.settings.dbName === undefined)
                    throw new Error("No database name specified.");
                this.Connect()
                    .then((obj) => {
                    let dbo = obj.db(this.settings.dbName);
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
         * @param Collection name
         * @param filter Filter the documents to update
         * @param toUpdate Values to set
         */
        this.UpdateOne = (collectionName, filter, toUpdate) => {
            return this.Update(collectionName, filter, toUpdate, "one");
        };
        /**
         * Update all documents matching the given filter
         * @param Collection name
         * @param filter Filter the documents to update
         * @param toUpdate Values to set
         */
        this.UpdateMany = (collectionName, filter, toUpdate) => {
            return this.Update(collectionName, filter, toUpdate, "many");
        };
        /**
         * Update all documents or just one matching the given filter depending on the specified mode
         * @param Collection name
         * @param filter Filter the documents to update
         * @param toUpdate Values to set
         * @param mode Update mode ("one"/"many")
         */
        this.Update = (collectionName, filter, toUpdate, mode) => {
            for (var a in filter)
                if (a === "_id" && typeof filter[a] === "string")
                    try {
                        filter[a] = mongodb_1.MongoClient.connect.ObjectId(filter[a]);
                    }
                    catch (ex) { }
            return new Promise((resolve, reject) => {
                if (this.settings.dbName === undefined)
                    throw new Error("No database name specified.");
                this.Connect()
                    .then((obj) => {
                    let dbo = obj.db(this.settings.dbName);
                    if (mode === "one")
                        dbo.collection(collectionName).updateOne(filter, toUpdate, (err, result) => {
                            obj.close();
                            if (err)
                                reject(err);
                            resolve(result);
                        });
                    else if (mode === "many")
                        dbo.collection(collectionName).updateMany(filter, toUpdate, (err, result) => {
                            obj.close();
                            if (err)
                                reject(err);
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
         * @param collectionName Collection name
         * @param filter Filter the document to delete
         */
        this.DeleteOne = (collectionName, filter) => {
            return this.DeleteDocument(collectionName, filter, "one");
        };
        /**
         * Delete all documents matching the given filter
         * @param collectionName Collection name
         * @param filter Filter the documents to delete
         */
        this.DeleteMany = (collectionName, filter) => {
            return this.DeleteDocument(collectionName, filter, "many");
        };
        /**
         * Delete all documents or just one matching the given filter depending on the specified mode
         * @param collectionName Collection name
         * @param filter Filter the documents to delete
         * @param mode Update mode ("one"/"many")
         */
        this.DeleteDocument = (collectionName, filter, mode) => {
            for (var a in filter)
                if (a === "_id" && typeof filter[a] === "string")
                    try {
                        filter[a] = mongodb_1.MongoClient.connect.ObjectId(filter[a]);
                    }
                    catch (ex) { }
            return new Promise((resolve, reject) => {
                if (this.settings.dbName === undefined)
                    throw new Error("No database name specified.");
                this.Connect()
                    .then((obj) => {
                    let dbo = obj.db(this.settings.dbName);
                    if (mode === "one")
                        dbo.collection(collectionName).deleteOne(filter, (err, result) => {
                            obj.close();
                            if (err)
                                reject(err);
                            resolve(result);
                        });
                    else if (mode === "many")
                        dbo.collection(collectionName).deleteMany(filter, (err, result) => {
                            obj.close();
                            if (err)
                                reject(err);
                            resolve(result);
                        });
                    else
                        reject(new Error("Invalid delete mode"));
                })
                    .catch((reason) => {
                    reject(reason);
                });
            });
        };
        switch (typeof settings) {
            case "undefined":
                this.settings = {
                    hostName: "localhost",
                    port: 27017
                };
                break;
            default:
                this.settings = {
                    fullURI: settings.fullURI,
                    hostName: settings.hostName ? settings.hostName : "localhost",
                    port: settings.port ? settings.port : 27017,
                    dbName: settings.dbName
                };
                break;
        }
        this.mongoClient = myMongoClient;
    }
}
exports.GomodMongo = GomodMongo;
// module.exports = GomodMongo;
exports.default = GomodMongo;
//# sourceMappingURL=gomod-mongo.js.map