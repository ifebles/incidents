import { GomodMongo } from "../require/gomod-mongo";
import { IMapperInjection } from "../models/gomod-mapper-models";


// const myPost = require("../require/myPostData");


export class LocalitiesController
{
    /**
     * Class property for MongoDB connections
     */
    public gomodMongo: GomodMongo;

    public localitiesCollection: string;

    constructor(gomodMongo: GomodMongo, localitiesCollection: string) {
        this.localitiesCollection = localitiesCollection;
        this.gomodMongo = gomodMongo;
    }

    public Localities = () => {
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
    }
    
    public Locality = (params: IMapperInjection) => {
        return new Promise((resolve, reject) => {
            if (!params.__variables || params.__variables.localityId === undefined)
            {
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
    }
}


// module.exports = LocalitiesController;
export default LocalitiesController;
