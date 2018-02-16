

/**
 * Object referencing the "fs" module
 */
const fs = require("fs");



/** Self referencing property
 * @type {myMapper} */
var self;

/** Mapping dictionary
 * @type {{name: { handler: function, parameters: { __context: { request: Object, response: Object }, params: ...{} }, variables: { raw: string, name: string, regex: string }, methods: string|string[] }}}
 * */
var mapper = {};

/** Handler for not found requests
 * @type {?function}
 */
var notFoundHandler = null;

/** Header handler for the valid requests
 * @type {?function}
 */
var headerHandler = null;

/** End of response handler for valid requests
 * @type {?function}
 */
var responseEndHandler = null;


/**
 * Methods allowed for the incoming requests
 */
const allowedMethods = [
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "copy",
    "head",
    "options",
    "link",
    "unlink",
    "purge",
    "lock",
    "unlock",
    "propfind",
    "view"
];


/**
 * Class constructor
 * @property {boolean} easyMediaMapping - Load media from the given folder as any media extension is requested
 * @property {string} imageDirectory - Root directory to load media from (default: "./public/images/")
 * @property {boolean} showhandlersContentOnStatusCodeNotOK - Show the content of the specified handler when the web response status code is not OK (>=400)
 * @property {*} lastMappedRoute - Gets the last routed request
 */
function myMapper() {
    this.easyMediaMapping = true;
    this.imageDirectory = "./public/images/";
    this.showhandlersContentOnStatusCodeNotOK = false;
    this.lastMappedRoute = null;
    self = this;
}


/**
 * Retrieve all the mapped routes
 */
myMapper.prototype.getMappedRoutes = () => {
    return mapper;
};


/**
 * Add new reference route to the project
 * @param {!string} routeName Route name (reference)
 * @param {!function} routeHandler Route handler (controller)
 * @param {*} paramDict Dictionary to send along with the "__context" property
 * @param {?...string|?string} methods Methods allowed for the requests
 */
myMapper.prototype.addRoute = (routeName, routeHandler, paramDict = undefined, methods = undefined) => {
    if (typeof routeName !== "string")
        throw new Error(`A string was expected for the first parameter (routeName). "${typeof routeName}" given.`);

    if (typeof routeHandler !== "function")
        throw new Error(`A function was expected for the second parameter (routeHandler). "${typeof routeHandler}" given.`);

    var typeOfMethods = typeof methods;

    switch(typeOfMethods)
    {
        case "undefined":
        case "string":
        case "object":
            if (typeOfMethods === "undefined")
                break;
            else if (typeOfMethods === "string")
            {
                methods = methods.trim().toLowerCase();

                if (methods.indexOf(",") !== -1)
                    methods = methods.split(",");                    
                else
                    methods = [methods];
            }
            else if (typeOfMethods === "object")
            {
                if (!methods.indexOf)
                    throw new Error(`A string or string[] was expected for the parameter <methods>. "${typeof methods}" given.`);

                methods = methods.toString().toLowerCase().split(",");
            }

            var filter = [];
            var doNotExist = false;

            for(var a in methods)
                if (doNotExist = allowedMethods.indexOf(methods[a].trim()) === -1)
                    break;
                else if (filter.indexOf(methods[a].trim()) === -1)
                    filter.push(methods[a].trim());

            if (doNotExist)
                throw new Error(`The given values for the parameter <methods> ("${methods}") are invalid. The allowed methods are "${allowedMethods}"`);

            methods = filter;
        break;

        default:
            throw new Error(`A string or string[] was expected for the parameter <methods>. "${typeof methods}" given.`);
    }

    // Quitar slashes iniciales, finales y los duplicados
    // routeName = routeName.replace(/(^\/+|(?<=\/)\/{1,}|\/+$)/g, "").trim().toLowerCase();
    routeName = routeName.replace(/\/{1,}/g, "/").replace(/(^\/+|\/+$)/g, "").trim();

    var variables = routeName.match(/\?\{\w[\w\d]*(:([^\{\}]+|[^\{\}]*\{.+\}[^\{\}]*))*\}/g);
    var processedVariables = [];

    // for (var a in mapper)
    //     if (a.toLowerCase() === routeName.toLowerCase())
    //         throw new Error("The given route name is already registered (\"" + routeName + "\")");

    if (mapper.hasOwnProperty(routeName.toLowerCase()))
        throw new Error(`The given route name is already registered ("${routeName}")`);

    for (var a in variables)
    {
        var clean = variables[a].substring(2, variables[a].length - 1);
        var parts = clean.split(":", 2);

        var name = parts[0];
        var regex = parts[1];

        try { new RegExp(regex) }
        catch (ex) {
            throw new Error(`Invalid regular expression: /${regex}/`);
        }

        processedVariables.push({
            raw: variables[a],
            name: name,
            regex: regex
        });
    }

    processedVariables = processedVariables.filter((value, index, self) => {
        return self.indexOf(value) === index;
    });

    mapper[routeName.toLowerCase()] = {
        handler: routeHandler,
        parameters: paramDict,
        variables: processedVariables,
        methods: methods,
        rawName: routeName
    };

    return self;
};


/**
 * Set behavior when a resource is not found
 * @param {!function} routeHandler Route handler (controller)
 * @param {*} paramDict Dictionary to send along with the "__context" property
 */
myMapper.prototype.setNotFound = (routeHandler, paramDict = undefined) => {
    if (typeof routeHandler !== "function" && routeHandler !== null)
        throw new Error(`A function was expected for the first parameter (routeHandler). "${typeof routeHandler}" given.`);

    if (routeHandler === null)
        notFoundHandler = null;
    else
        notFoundHandler = {
            handler: routeHandler,
            parameters: paramDict
        };

    return self;
}


/**
 * Set behavior and adding headers when a valid request is made
 * @param {!function} routeHandler Route handler (controller)
 * @param {*} paramDict Dictionary to send along with the "__context" property
 */
myMapper.prototype.setHeaderHandler = (routeHandler, paramDict = undefined) => {
    if (typeof routeHandler !== "function" && routeHandler !== null)
        throw new Error(`A function was expected for the first parameter (routeHandler). "${typeof routeHandler}" given.`);

    if (routeHandler === null)
        headerHandler = null;
    else
        headerHandler = {
            handler: routeHandler,
            parameters: paramDict
        };

    return self;
};


/**
 * Set behavior for the end of the response when a valid request is made
 * @param {!function} routeHandler Route handler (controller)
 * @param {*} paramDict Dictionary to send along with the "__context" property
 */
myMapper.prototype.setEndOfResponse = (routeHandler, paramDict = undefined) => {
    if (typeof routeHandler !== "function" && routeHandler !== null)
        throw new Error(`A function was expected for the first parameter (routeHandler). "${typeof routeHandler}" given.`);

    if (routeHandler === null)
        responseEndHandler = null;
    else
        responseEndHandler = {
            handler: routeHandler,
            parameters: paramDict
        };

    return self;
}


/**
 * Call the correspondent handler (controller) based on the request
 * @param {!string} routeName Route name (reference)
 * @param {{ request: Object, response: Object }} context Current request and response
 */
myMapper.prototype.getRoute = (routeName, context) => {
    if (typeof routeName !== "string")
        throw new Error(`A string was expected for the first parameter (routeName). "${typeof routeName}" given.`);

    if (typeof context !== "object")
        throw new Error(`An object was expected for the second parameter (context). "${typeof context}" given.`);

    if (!context.hasOwnProperty("request"))
        throw new Error("The second parameter (context) must have a \"request\" property.");

    if (!context.hasOwnProperty("response"))
        throw new Error("The second parameter (context) must have a \"response\" property.");

    // Quitar slashes iniciales, finales y los duplicados
    // routeName = routeName.replace(/(^\/+|(?<=\/)\/{1,}|\/+$)/g, "").trim().toLowerCase();
    routeName = decodeURI(routeName.replace(/\/{1,}/g, "/").replace(/(^\/+|\/+$)/g, "").trim());
    
    // Alias to use in case a complex URL is used
    var routeAlias = routeName.toLowerCase();


    if (self.easyMediaMapping && loadEasyMedia(routeName, context))
        return true;

    var exists = mapper.hasOwnProperty(routeAlias);
    var variables = null;

    if (!exists)
    {
        var routesWithVariables = {};
        var containsComplexURL = false;

        for (var a in mapper)
            if (a.indexOf("?") !== 1 && mapper[a].variables.length > 0)
            {
                containsComplexURL = true;
                routesWithVariables[a] = mapper[a];
            }

        if (containsComplexURL)
            for (var a in routesWithVariables)
            {
                var constructedRegex = routesWithVariables[a].rawName;

                for (var b in routesWithVariables[a].variables)
                    constructedRegex = constructedRegex.replace (
                        routesWithVariables[a].variables[b].raw,
                        routesWithVariables[a].variables[b].regex === undefined ? "[^\/]+": routesWithVariables[a].variables[b].regex
                    );

                constructedRegex = "^" + constructedRegex + "$";

                
                if (exists = routeName.match(new RegExp(constructedRegex)) ? true: false)
                {
                    variables = {};

                    for (var b in routesWithVariables[a].variables)
                    {
                        var blockRegex = routesWithVariables[a].rawName.replace (
                            routesWithVariables[a].variables[b].raw,
                            ")" + (routesWithVariables[a].variables[b].regex === undefined ? "[^\/]+": routesWithVariables[a].variables[b].regex) + "(?="
                        );

                        for (var c in routesWithVariables[a].variables)
                            if (c !== b)
                                blockRegex = blockRegex.replace (
                                    routesWithVariables[a].variables[b].raw,
                                    "(?=.+)"
                                );


                        blockRegex = "(?<=" + blockRegex + ")";

                        if (blockRegex.startsWith("(?<=)"))
                            blockRegex = blockRegex.substring("(?<=)".length);

                        if (blockRegex.endsWith("(?=)"))
                            blockRegex = blockRegex.substring(0, blockRegex.lastIndexOf('(?=)'));

                        var regexResult = routeName.match(new RegExp(blockRegex));

                        regexResult = regexResult.filter((value, index, self) => {
                            return value !== "";
                        });

                        variables[routesWithVariables[a].variables[b].name] = regexResult[regexResult.length - 1];
                    }

                    routeAlias = a;

                    break;
                }
            }
    }

    if (!exists)
    {
        context.response.writeHead(404, {
            'Content-Type': 'text/html'
        });

        if (notFoundHandler)
        {
            if (notFoundHandler.parameters === undefined)
                notFoundHandler.parameters = { __context: context, __variables: variables, __myMapper: self };
            else
            {
                notFoundHandler.parameters.__context = context;
                notFoundHandler.parameters.__variables = variables;
                notFoundHandler.parameters.__myMapper = self;
            }

            notFoundHandler.handler(notFoundHandler.parameters);
        }

        context.response.end();
        return false;
    }

    self.lastMappedRoute = context["currentMapping"] = mapper[routeAlias];

    if (!headerHandler)
    {
        var status = 200;
        
        if (mapper[routeAlias].methods !== undefined && mapper[routeAlias].methods.indexOf(context.request.method.toLowerCase()) === -1)
            status = 405; // Not Allowed

        context.response.writeHead(status, {
            'Content-Type': 'text/html'
        });
    }
    else
    {
        if (headerHandler.parameters === undefined)
            headerHandler.parameters = { __context: context, __variables: variables, __myMapper: self };
        else
        {
            headerHandler.parameters.__context = context;
            headerHandler.parameters.__variables = variables;
            headerHandler.parameters.__myMapper = self;
        }
            
        headerHandler.handler(headerHandler.parameters);
    }

    if (context.response.statusCode >= 400 && self.showhandlersContentOnStatusCodeNotOK === false)
    {
        context.response.end();
        return false;
    }

    if (mapper[routeAlias].parameters === undefined)
        mapper[routeAlias].parameters = { __context: context, __variables: variables, __myMapper: self };
    else
    {
        mapper[routeAlias].parameters.__context = context;
        mapper[routeAlias].parameters.__variables = variables;
        mapper[routeAlias].parameters.__myMapper = self;
    }

    var result = mapper[routeAlias].handler(mapper[routeAlias].parameters);

    if (!responseEndHandler)
    {
        if (!context.response.finished)
            context.response.end();
    }
    else
    {
        if (responseEndHandler.parameters === undefined)
            responseEndHandler.parameters = { __context: context, __variables: variables, __myMapper: self };
        else
        {
            responseEndHandler.parameters.__context = context;
            responseEndHandler.parameters.__variables = variables;
            responseEndHandler.parameters.__myMapper = self;
        }
        
        responseEndHandler.handler(responseEndHandler.parameters);
    }

    // Garantizar que se retorne un booleano
    return result === undefined || (result ? true: false);
};


/**
 * Load specified media 
 * @param {!string} routeName Route name (reference)
 * @param {{ request: Object, response: Object }} context Current request and response
 */
var loadEasyMedia = (routeName, context) => {
    if (mapper.hasOwnProperty(routeName) || routeName.indexOf(".") === -1)
        return false;

    var folderName = "";
    var extensionName = routeName.substring(routeName.lastIndexOf(".") + 1).toLowerCase();

    switch (extensionName)
    {
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
        case "bmp":
        case "webp":
        case "ico":
        case "svg":
            try
            {
                if (!fs.statSync(self.imageDirectory + routeName).isFile())
                    return false;
            }
            catch (ex){
                if (ex.code === 'ENOENT')
                    return false;
                else
                    throw ex;
            }

            var mimeResult = () => {
                var myResult =
                {
                    "jpg": "jpeg",
                    "ico": "x-icon",
                    "svg": "svg+xml"
                };

                if (myResult.hasOwnProperty(extensionName))
                    return myResult[extensionName];
                else
                    return extensionName;
            };
            
            
            context.response.writeHead(200, {
                "Content-Type": "image/" + mimeResult()
            });
            
            break;

        default:
            return false;
    }

    var content = fs.readFileSync(self.imageDirectory + routeName);

    context.response.end(content, 'binary');

    return true;
};


module.exports = myMapper;
