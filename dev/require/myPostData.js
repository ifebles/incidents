
const qs = require("querystring");


/**
 * Get the posted values from the request
 * @param {IncomingMessage} request Current request made to the server 
 */
exports.get = (request) => {
    var requestBody = "";
    // var requestBody_arr = [];

    return new Promise((resolve, reject) => {
        try
        {
            request.on("data", (data) => {
                requestBody += data;
                // requestBody_arr.push(data);
            });

            request.on("end", () => {
                resolve(qs.parse(requestBody));
            });
        }
        catch(ex) {
            reject(ex);
        }
    });
} 
