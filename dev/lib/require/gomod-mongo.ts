
const myMongoClient = require("mongodb").MongoClient;
import { MongoClient, InsertWriteOpResult, UpdateWriteOpResult, DeleteWriteOpResultObject } from "mongodb";


export class GomodMongo
{
    private settings: IMongoSettings;

    public mongoClient: MongoClient;

    constructor(settings?: IMongoSettings)
    {
        switch(typeof settings)
        {
            case "undefined":
                this.settings = {
                    hostName: "localhost",
                    port: 27017
                };
            break;

            default:
                this.settings = {
                    fullURI: settings!.fullURI,
                    hostName: settings!.hostName ? settings!.hostName: "localhost",
                    port: settings!.port ? settings!.port: 27017,
                    dbName: settings!.dbName
                }
            break;
        }

        this.mongoClient = myMongoClient;
    }


    /**
     * Set the host name to use on upcomming connections
     * @param host Host name
     */
    public SetHostName = (host: string) => {

        this.settings.hostName = host;
        return this;
    };


    /**
     * Set the port number to use on upcomming connections
     * @param portNumber Port number
     */
    public SetPort = (portNumber: number) => {

        this.settings.port = portNumber;
        return this;
    };


    /**
     * Set the database name to use on upcomming connections
     * @param databaseName Database name
     */
    public SetDbName = (databaseName: string) => {

        this.settings.dbName = databaseName;
        return this;
    };


    /**
     * Set the connection string to use on upcomming connections
     * @param connectionString Host name
     */
    public SetURI = (connectionString: string) => {

        this.settings.fullURI = connectionString;
        return this;
    };


    /**
     * Create a MongoDB connection
     */
    public Connect = (): Promise<MongoClient> => {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.settings.fullURI ? this.settings.fullURI: `mongodb://${this.settings.hostName}:${this.settings.port}/${this.settings.dbName ? this.settings.dbName: ""}`, (err, con) => {
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
     * @param collectionName Collection name
     * @param document Document (row) to insert
     */
    public InsertOne = (collectionName: string, document: {}) => {
        // Method created to keep up with the convention (one - many)
        return this.InsertMany(collectionName, [document]);
    };


    /**
     * Insert a document into the specified collection
     * @param collectionName Collection name
     * @param document Document (row) to insert
     */
    public Insert = (collectionName: string, document: {}) => {
        return this.InsertMany(collectionName, [document]);
    };


    /**
     * Insert one or more documents into the specified collection
     * @param collectionName Collection name
     * @param documents Documents (rows) to insert
     */
    public InsertMany = (collectionName: string, documents: {}[]): Promise<InsertWriteOpResult> => {
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
    public FindOne = (collectionName: string, filter: IMongoFilter = {}, toShow?: {}): Promise<{} | null> => {
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
    public FindMany = (collectionName: string, filter: IMongoFilter = {}, toShow?: {}) => {
        // Method created to keep up with the convention (one - many)
        return this.Find(collectionName, filter, toShow);
    };


    /**
     * Find the documents mathing the given filter
     * @param collectionName Collection name
     * @param filter Filter for the search
     * @param toShow Fields to show in the result
     */
    public Find = (collectionName: string, filter: IMongoFilter = {}, toShow?: {}): Promise<any[]> => {
        
        if (filter)
            for (var a in filter)
                if (a === "_id" && typeof filter[a] === "string")
                    try {
                        filter[a] = (MongoClient.connect as any).ObjectId(filter[a]);
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
    public UpdateOne = (collectionName: string, filter: {}, toUpdate: {}) => {
        return this.Update(collectionName, filter, toUpdate, "one");
    };


    /**
     * Update all documents matching the given filter
     * @param Collection name
     * @param filter Filter the documents to update
     * @param toUpdate Values to set
     */
    public UpdateMany = (collectionName: string, filter: {}, toUpdate: {}) => {
        return this.Update(collectionName, filter, toUpdate, "many");
    };


    /**
     * Update all documents or just one matching the given filter depending on the specified mode
     * @param Collection name
     * @param filter Filter the documents to update
     * @param toUpdate Values to set
     * @param mode Update mode ("one"/"many")
     */
    private Update = (collectionName: string, filter: IMongoFilter, toUpdate: {}, mode: string): Promise<UpdateWriteOpResult> => {

        for (var a in filter)
            if (a === "_id" && typeof filter[a] === "string")
                try {
                    filter[a] = (MongoClient.connect as any).ObjectId(filter[a]);
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
     * @param collectionName Collection name
     * @param filter Filter the document to delete
     */
    public DeleteOne = (collectionName: string, filter: {}) => {
        return this.DeleteDocument(collectionName, filter, "one");
    };


    /**
     * Delete all documents matching the given filter
     * @param collectionName Collection name
     * @param filter Filter the documents to delete
     */
    public DeleteMany = (collectionName: string, filter: {}) => {
        return this.DeleteDocument(collectionName, filter, "many");
    };


    /**
     * Delete all documents or just one matching the given filter depending on the specified mode
     * @param collectionName Collection name
     * @param filter Filter the documents to delete
     * @param mode Update mode ("one"/"many")
     */
    private DeleteDocument = (collectionName: string, filter: IMongoFilter, mode: string): Promise<DeleteWriteOpResultObject> => {

        for (var a in filter)
            if (a === "_id" && typeof filter[a] === "string")
                try {
                    filter[a] = (MongoClient.connect as any).ObjectId(filter[a]);
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
                        reject(new Error("Invalid delete mode"));
                })
                .catch((reason) => {
                    reject(reason);
                });
        });
    };
}


interface IMongoSettings
{
    /**
     * Full connection string
     */
    fullURI?: string;
    /**
     * Host name
     */
    hostName?: string;
    /**
     * Port number
     */
    port?: number;
    /**
     * Database name
     */
    dbName?: string;
}

interface IMongoFilter {
    [key: string]: any
}


// module.exports = GomodMongo;
export default GomodMongo;
