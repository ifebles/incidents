"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const myPost = require("../require/myPostData");
class LocalitiesController {
    constructor(gomodMongo, localitiesCollection) {
        this.Localities = () => {
            return new Promise((resolve, reject) => {
                this.gomodMongo.Find(this.localitiesCollection)
                    .then((obj) => {
                    resolve(obj);
                })
                    .catch((reason) => {
                    console.log(reason);
                    resolve([]);
                });
            });
        };
        this.Locality = (params) => {
            return new Promise((resolve, reject) => {
                if (!params.__variables || params.__variables.localityId === undefined) {
                    reject(new Error(`Parameter "localityId" not sent`));
                    return;
                }
                this.gomodMongo.FindOne(this.localitiesCollection, {
                    _id: params.__variables.localityId
                }).then((obj) => {
                    resolve(obj || {});
                }).catch((reason) => {
                    console.log(reason);
                    resolve({});
                });
            });
        };
        this.localitiesCollection = localitiesCollection;
        this.gomodMongo = gomodMongo;
    }
}
exports.LocalitiesController = LocalitiesController;
// module.exports = LocalitiesController;
exports.default = LocalitiesController;
//# sourceMappingURL=localities-controller.js.map