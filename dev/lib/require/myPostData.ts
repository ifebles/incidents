import qs, { ParsedUrlQuery } from "querystring";
import { IncomingMessage } from "http";


/**
 * Get the posted values from the request
 * @param request Current request made to the server 
 */
export function get (request: IncomingMessage): Promise<ParsedUrlQuery> {
    let requestBody = "";
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
