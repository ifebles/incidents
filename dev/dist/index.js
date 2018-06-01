"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const init = __importStar(require("./initializer"));
const url = __importStar(require("url"));
let port = 8000;
init.initializeDB();
http.createServer((req, res) => {
    var myUrl = url.parse(req.url);
    init.mapper.GetRoute(myUrl.pathname, { request: req, response: res });
}).listen(port);
console.log(`Server running on "localhost:${port}"`);
//# sourceMappingURL=index.js.map