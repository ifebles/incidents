import * as http from "http";
import * as init from "./initializer";
import * as url from "url";

let port = 8000;

init.initializeDB();

http.createServer((req, res) => {
    var myUrl = url.parse(req.url!);

    init.mapper.GetRoute(myUrl.pathname!, {request: req, response: res});
    
}).listen(port);

console.log(`Server running on "localhost:${port}"`);
