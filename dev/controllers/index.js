/* Módulo para crear controladores */

const MongoClient = require("mongodb").MongoClient;
const qs = require("querystring");

const hostName = process.env.INCIDENTS_DB_SERVER_NAME !== undefined ? process.env.INCIDENTS_DB_SERVER_NAME: "localhost";

const mongoUrl = `mongodb://${hostName}:27017/`;
const mongoDBName = "incident";
const mongoCol_locality = "dbLocality";
const mongoCol_incidents = "dbIncident";


exports.incidents = (params) => {
    switch (params.__context.request.method.toLowerCase())
    {
        case "get":
            params.__myMapper.setEndOfResponse(() => {
                MongoClient.connect(mongoUrl, (err, db) => {
                    if (err) throw err;
                    
                    var dbo = db.db(mongoDBName);
        
                    dbo.collection(mongoCol_incidents).find({ isArchived: false }).toArray((err, resp) => {
                            if (err) throw err;
                
                            params.__context.response.end(JSON.stringify(resp));
                            db.close();
                        });
                });
                
                params.__myMapper.setEndOfResponse(null);
            });
        break;

        case "post":
            var requestBody = "";
            // var requestBody_arr = [];

            params.__context.request.on("data", (data) => {
                requestBody += data;
                // requestBody_arr.push(data);
            });

            params.__myMapper.setEndOfResponse((innerParams) => {
                params.__context.request.on("end", () => {
                    var formData = qs.parse(requestBody);

                    // console.log(Buffer.concat(requestBody_arr).toString())
                    // console.log(requestBody_arr)

                    const validParams = [
                        "kind", "locationId", "happenedAt"
                    ];

                    for (var a in formData)
                        if (validParams.indexOf(a) === -1)
                        {
                            console.log(`/POST incidents/: Invalid param "${a}"`)
                            innerParams.__context.response.end("false");
                            return;
                        }

                    var isValid = () => {
                        
                        if (typeof formData.kind !== "string")
                            return false;
                        else if (["ROBBERY", "MURDER", "TRAFFIC_ACCIDENT", "SHOOTING", "ASSAULT"]
                                .indexOf(formData.kind = formData.kind.trim().toUpperCase()) === -1)
                            return false;
                        else if (typeof formData.happenedAt !== "string")
                            return false;
                        else if (formData.happenedAt.match(/\d{1,2}\:\d{1,2}\:\d{1,2}$/) ?
                                ((formData.happenedAt = new Date(formData.happenedAt).toJSON()) === null):
                                ((formData.happenedAt = new Date(formData.happenedAt + " 00:00:00").toJSON()) === null))
                            return false;

                        return true;
                    }

                    MongoClient.connect(mongoUrl, (err, db) => {
                        if (err) throw err;
            
                        var dbo = db.db(mongoDBName);
            
                        try
                        {
                            dbo.collection(mongoCol_locality).findOne(
                                { _id: MongoClient.connect.ObjectId(formData.locationId) },
                                (err, resp) => {
                                    if (err) throw err;
                        
                                    if (resp && isValid())
                                        dbo.collection(mongoCol_incidents).insert({
                                            kind: formData.kind,
                                            locationId: formData.locationId,
                                            happenedAt: formData.happenedAt,
                                            isArchived: false
                                        }, (err, resp) => {
                                            if (err) throw err;

                                            if (resp.result.ok && resp.result.n)
                                                innerParams.__context.response.end("true");
                                            else
                                            {
                                                console.log(`/POST incidents/: Values not inserted: "${JSON.stringify(formData)}". Result: "${JSON.stringify(resp.result)}"`)
                                                innerParams.__context.response.end("false");
                                            }

                                            db.close();
                                        });
                                    else
                                    {
                                        console.log(`/POST incidents/: Invalid param(s): "${JSON.stringify(formData)}".`)
                                        innerParams.__context.response.end("false");
                                        db.close();
                                    }
                                });
                        }
                        catch (ex) {
                            console.log(`/POST incidents/: Exception ocurred: "${JSON.stringify(ex)}".`)
                            params.__context.response.end("false");
                            db.close();
                        }
                    });
                });

                params.__myMapper.setEndOfResponse(null);
            });
            
        break;
    }
}

exports.archiveIncident = (params) => {
    params.__myMapper.setEndOfResponse(() => {
        MongoClient.connect(mongoUrl, (err, db) => {
            if (err) throw err;

            var dbo = db.db(mongoDBName);

            try
            {
                dbo.collection(mongoCol_incidents).updateOne(
                    { _id: MongoClient.connect.ObjectId(params.__variables.incidentId) },
                    { $set: { isArchived: true } },
                    (err, resp) => {
                        if (err) throw err;
            
                        if (resp.result.n)
                            params.__context.response.end("true");
                        else
                            params.__context.response.end("false");

                        db.close();
                    });
            }
            catch (ex)
            {
                params.__context.response.end("false");
                db.close();
            }
        });
        
        params.__myMapper.setEndOfResponse(null);
    });
}

exports.localities = (params) => {
    params.__myMapper.setEndOfResponse(() => {
        MongoClient.connect(mongoUrl, (err, db) => {
            if (err) throw err;
            
            var dbo = db.db(mongoDBName);
    
            dbo.collection(mongoCol_locality).find({}).toArray((err, resp) => {
                if (err) throw err;
    
                params.__context.response.end(JSON.stringify(resp));
                db.close();
            });
        });
        
        params.__myMapper.setEndOfResponse(null);
    });
}

exports.locality = (params) => {
    params.__myMapper.setEndOfResponse(() => {
        MongoClient.connect(mongoUrl, (err, db) => {
            if (err) throw err;

            var dbo = db.db(mongoDBName);

            try
            {
                dbo.collection(mongoCol_locality).findOne(
                    { _id: MongoClient.connect.ObjectId(params.__variables.localityId) },
                    (err, resp) => {
                        if (err) throw err;
            
                        params.__context.response.end(JSON.stringify(resp || {}));
                        db.close();
                    });
            }
            catch (ex)
            {
                params.__context.response.end(JSON.stringify({}));
                db.close();
            }
        });
        
        params.__myMapper.setEndOfResponse(null);
    });
}

