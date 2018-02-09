
const http = require('http');
const url = require('url');
const init = require("./initializer");

var port = 8000;

init.initializeDB();

http.createServer((req, res) => {
    var myUrl = url.parse(req.url);

    init.mapper.getRoute(myUrl.pathname, {request: req, response: res});
    
}).listen(port);

console.log(`Server running on "localhost:${port}"`);
