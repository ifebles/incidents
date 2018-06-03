"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const myPost = __importStar(require("../require/myPostData"));
class IncidentsController {
    constructor(gomodMongo, incidentsCollection, localitiesCollection) {
        this.Incidents = (params) => {
            let serverRequest = params.__context.request;
            switch (serverRequest.method) {
                case "GET":
                    return new Promise((resolve, reject) => {
                        this.gomodMongo.Find(this.incidentsCollection, {
                            isArchived: false
                        }).then((obj) => {
                            resolve(obj);
                        }).catch((reason) => {
                            console.log(reason);
                            resolve([]);
                        });
                    });
                case "POST":
                    return new Promise((resolve, reject) => {
                        myPost.get(serverRequest)
                            .then((formData) => {
                            const validParams = [
                                "kind", "locationId", "happenedAt"
                            ];
                            for (var a in formData)
                                if (validParams.indexOf(a) === -1) {
                                    console.log(`/POST incidents/: Invalid param "${a}"`);
                                    resolve(false);
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
                                    ((formData.happenedAt = new Date(formData.happenedAt).toJSON()) === null) :
                                    ((formData.happenedAt = new Date(formData.happenedAt + " 00:00:00").toJSON()) === null))
                                    return false;
                                return true;
                            };
                            this.gomodMongo.FindOne(this.localitiesCollection, {
                                _id: formData.locationId
                            }).then((obj) => {
                                if (obj && isValid())
                                    this.gomodMongo.Insert(this.incidentsCollection, {
                                        kind: formData.kind,
                                        locationId: formData.locationId,
                                        happenedAt: formData.happenedAt,
                                        isArchived: false
                                    }).then((resp) => {
                                        if (resp.result.ok && resp.result.n)
                                            resolve(true);
                                        else {
                                            console.log(`/POST incidents/: Values not inserted: "${JSON.stringify(formData)}". Result: "${JSON.stringify(resp.result)}"`);
                                            resolve(false);
                                        }
                                    }).catch((reason) => {
                                        console.log(reason);
                                        resolve(false);
                                    });
                                else {
                                    console.log(`/POST incidents/: Invalid param(s): "${JSON.stringify(formData)}".`);
                                    resolve(false);
                                }
                            }).catch((reason) => {
                                console.log(reason);
                                resolve(false);
                            });
                        })
                            .catch((reason) => {
                            console.log(reason);
                            resolve(false);
                        });
                    });
            }
        };
        this.ArchiveIncident = (params) => {
            return new Promise((resolve, reject) => {
                if (!params.__variables || params.__variables.incidentId === undefined) {
                    reject(new Error(`Parameter "incidentId" not sent`));
                    return;
                }
                this.gomodMongo.FindOne(this.incidentsCollection, {
                    _id: params.__variables.incidentId,
                    isArchived: false
                }).then((resultObj) => {
                    if (resultObj === null)
                        // Simulate a "bad" response
                        return {
                            result: {
                                n: null
                            }
                        };
                    else
                        return this.gomodMongo.UpdateOne(this.incidentsCollection, {
                            _id: params.__variables.incidentId
                        }, {
                            $set: {
                                isArchived: true
                            }
                        });
                }).then((resp) => {
                    if (resp.result.n)
                        resolve(true);
                    else
                        resolve(false);
                }).catch((reason) => {
                    console.log(reason);
                    resolve(false);
                });
            });
        };
        this.incidentsCollection = incidentsCollection;
        this.localitiesCollection = localitiesCollection;
        this.gomodMongo = gomodMongo;
    }
}
exports.IncidentsController = IncidentsController;
// module.exports = IncidentsController;
exports.default = IncidentsController;
//# sourceMappingURL=incidents-controller.js.map