/* Módulo para crear controladores */

const myPost = require("../require/myPostData");


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
    let serverResponse = params.__context.response;
    let serverRequest = params.__context.request;

    switch (serverRequest.method.toLowerCase())
    {
        case "get":
            self.myMongo.find(self.mongoCol_incidents, {
                isArchived: false
            }).then((obj) => {
                serverResponse.end(JSON.stringify(obj));
            }).catch((reason) => {
                console.log(reason);
                serverResponse.end(JSON.stringify([]));
            });
        break;

        case "post":
            myPost.get(serverRequest)
                .then((formData) => {
                    const validParams = [
                        "kind", "locationId", "happenedAt"
                    ];
    
                    for (var a in formData)
                        if (validParams.indexOf(a) === -1)
                        {
                            console.log(`/POST incidents/: Invalid param "${a}"`)
                            serverResponse.end(JSON.stringify(false));
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
                                    serverResponse.end(JSON.stringify(true));
                                else
                                {
                                    console.log(`/POST incidents/: Values not inserted: "${JSON.stringify(formData)}". Result: "${JSON.stringify(resp.result)}"`)
                                    serverResponse.end(JSON.stringify(false));
                                }
                            }).catch((reason) => {
                                console.log(reason);
                                serverResponse.end(JSON.stringify(false));
                            });
                        else
                        {
                            console.log(`/POST incidents/: Invalid param(s): "${JSON.stringify(formData)}".`)
                            serverResponse.end(JSON.stringify(false));
                        }
                    }).catch((reason) => {
                        console.log(reason);
                        serverResponse.end(JSON.stringify(false));
                    });
                })
                .catch((reason) => {
                    console.log(reason);
                    serverResponse.end(JSON.stringify(false));
                });
        break;
    }
}

exports.archiveIncident = (params) => {
    let serverResponse = params.__context.response;

    self.myMongo.findOne(self.mongoCol_incidents, {
        _id: params.__variables.incidentId,
        isArchived: false
    }).then((resultObj) => {
        if (resultObj === null)
            return {
                result: false
            };
        else
            return self.myMongo.updateOne(self.mongoCol_incidents, {
                _id: params.__variables.incidentId
            }, {
                $set: {
                    isArchived: true
                    }
            });
    }).then((resp) => {
        if (resp.result.n)
            serverResponse.end(JSON.stringify(true));
        else
            serverResponse.end(JSON.stringify(false));
    }).catch((reason) => {
        console.log(reason);
        serverResponse.end(JSON.stringify(false));
    });

    // self.myMongo.updateOne(self.mongoCol_incidents, {
    //     _id: params.__variables.incidentId
    // }, {
    //     $set: { 
    //         isArchived: true
    //      }
    // }).then((resp) => {
    //     if (resp.result.n)
    //         serverResponse.end(JSON.stringify(true));
    //     else
    //         serverResponse.end(JSON.stringify(false));
    // }).catch((reason) => {
    //     console.log(reason);
    //     serverResponse.end(JSON.stringify(false));
    // });
}

exports.localities = (params) => {
    let serverResponse = params.__context.response;

    self.myMongo.find(self.mongoCol_locality)
    .then((obj) => {
        serverResponse.end(JSON.stringify(obj));
    })
    .catch((reason) => {
        console.log(reason);
        serverResponse.end(JSON.stringify([]));
    });
}

exports.locality = (params) => {
    let serverResponse = params.__context.response;

    self.myMongo.findOne(self.mongoCol_locality, {
        _id: params.__variables.localityId
    }).then((obj) => {
        serverResponse.end(JSON.stringify(obj || {}));
    }).catch((reason) => {
        console.log(reason);
        serverResponse.end(JSON.stringify({}));
    });
}
