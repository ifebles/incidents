/* Módulo para crear controladores */

const qs = require("querystring");

const hostName = process.env.INCIDENTS_DB_SERVER_NAME !== undefined ? process.env.INCIDENTS_DB_SERVER_NAME: "localhost";


/**
 * Property referencing the current instance
 */
var self = this;


/**
 * Class property for MongoDB connections
 */
this.myMongo = null;

this.mongoCol_locality = null;
this.mongoCol_incidents = null;


exports.incidents = (params) => {
    switch (params.__context.request.method.toLowerCase())
    {
        case "get":
            params.__myMapper.setEndOfResponse(() => {
                self.myMongo.find(self.mongoCol_incidents, {
                    isArchived: false
                }).then((obj) => {
                    params.__context.response.end(JSON.stringify(obj));
                }).catch((reason) => {
                    console.log(reason);
                    params.__context.response.end("[]");
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

                    self.myMongo.findOne(self.mongoCol_locality, {
                        _id: formData.locationId
                    }).then((obj) => {
                        if (obj && isValid())
                            self.myMongo.insert(self.mongoCol_incidents, {
                                kind: formData.kind,
                                locationId: formData.locationId,
                                happenedAt: formData.happenedAt,
                                isArchived: false
                            }).then((resp) => {
                                if (resp.result.ok && resp.result.n)
                                    innerParams.__context.response.end("true");
                                else
                                {
                                    console.log(`/POST incidents/: Values not inserted: "${JSON.stringify(formData)}". Result: "${JSON.stringify(resp.result)}"`)
                                    innerParams.__context.response.end("false");
                                }
                            }).catch((reason) => {
                                console.log(reason);
                                innerParams.__context.response.end("false");
                            });
                        else
                            {
                                console.log(`/POST incidents/: Invalid param(s): "${JSON.stringify(formData)}".`)
                                innerParams.__context.response.end("false");
                            }
                    }).catch((reason) => {
                        console.log(reason);
                        innerParams.__context.response.end("false");
                    });
                });

                params.__myMapper.setEndOfResponse(null);
            });
            
        break;
    }
}

exports.archiveIncident = (params) => {
    params.__myMapper.setEndOfResponse(() => {
        self.myMongo.updateOne(self.mongoCol_incidents, {
            _id: params.__variables.incidentId
        }, {
            $set: { 
                isArchived: true
             }
        }).then((resp) => {
            if (resp.result.n)
                params.__context.response.end("true");
            else
                params.__context.response.end("false");
        }).catch((reason) => {
            console.log(reason);
            params.__context.response.end("false");
        });
        
        params.__myMapper.setEndOfResponse(null);
    });
}

exports.localities = (params) => {
    params.__myMapper.setEndOfResponse(() => {
        self.myMongo.find(self.mongoCol_locality)
            .then((obj) => {
                params.__context.response.end(JSON.stringify(obj));
            })
            .catch((reason) => {
                console.log(reason);
                params.__context.response.end("[]");
            });
        
        params.__myMapper.setEndOfResponse(null);
    });
}

exports.locality = (params) => {
    params.__myMapper.setEndOfResponse(() => {
        self.myMongo.findOne(self.mongoCol_locality, {
            _id: params.__variables.localityId
        }).then((obj) => {
            params.__context.response.end(JSON.stringify(obj || {}));
        }).catch((reason) => {
            console.log(reason);
            params.__context.response.end("{}");
        });
        
        params.__myMapper.setEndOfResponse(null);
    });
}
