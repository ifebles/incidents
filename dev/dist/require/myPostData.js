"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const querystring_1 = __importDefault(require("querystring"));
/**
 * Get the posted values from the request
 * @param request Current request made to the server
 */
function get(request) {
    let requestBody = "";
    // var requestBody_arr = [];
    return new Promise((resolve, reject) => {
        try {
            request.on("data", (data) => {
                requestBody += data;
                // requestBody_arr.push(data);
            });
            request.on("end", () => {
                resolve(querystring_1.default.parse(requestBody));
            });
        }
        catch (ex) {
            reject(ex);
        }
    });
}
exports.get = get;
//# sourceMappingURL=myPostData.js.map