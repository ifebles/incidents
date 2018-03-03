

/**
 * Object referencing the "fs" module
 */
const fs = require("fs");



/** Self referencing property
 * @type {myMapper} */
var self;

/** Mapping dictionary
 * @type {{[name: string]: { handler: function, parameters: { __context: { request: Object, response: Object }, params: ...{} }, variables: { raw: string, name: string, regex: string }, methods: string|string[], handlesEndOfResponse: boolean }}}
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
 * Supported application types
 */
const applicationTypes = {
    [Symbol.iterator]: function*() {
        for (let a in this)
            yield this[a];
    },
    WebSite: "website",
    WebAPI: "webapi"
};

/**
 * Application type assigned for the current instance
 * @type {string}
 */
var instanceType;

/**
 * Assign response header before the reponse handler is called
 * @type {boolean}
 */
var setHeaderBeforeHandler;

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
 * @param {string} applicationType Specify the application type for the mapper instance (e.g. "WebSite/WebAPI")
 * @property {boolean} easyMediaMapping - Load media from the given folder as any media extension is requested
 * @property {string} imageDirectory - Root directory to load media from (default: "./public/images/")
 * @property {boolean} showhandlersContentOnStatusCodeNotOK - Show the content of the specified handler when the web response status code is not OK (>=400)
 * @property {*} lastMappedRoute - Gets the last routed request
 */
function myMapper(applicationType = "WebSite") {
    this.easyMediaMapping = true;
    this.imageDirectory = "./public/images/";
    this.showhandlersContentOnStatusCodeNotOK = false;
    this.lastMappedRoute = null;
    self = this;

    if (typeof applicationType !== "string")
        throw new Error(`Invalid "Application Type" specified: a string was expected ("${typeof applicationType}" was given).`);

    if ([...applicationTypes].indexOf((applicationType = applicationType.trim()).toLowerCase()) === -1)
        throw new Error(`Unsuported application type "${applicationType}". The supported types are "${[...applicationTypes]}".`);

    instanceType = applicationType.toLowerCase();

    if (instanceType === applicationTypes.WebSite)
        setHeaderBeforeHandler = true;
    else if (instanceType === applicationTypes.WebAPI)
        setHeaderBeforeHandler = false;
}


myMapper.prototype.setHeaderBeforeHandler = (value) => {
    setHeaderBeforeHandler = value || value === undefined ? true: false;
    return self;
};

/**
 * Retrieve all the mapped routes
 */
myMapper.prototype.getMappedRoutes = () => {
    return mapper;
};


/**
 * Add new reference route to the project
 * @param {!string} routeName Route name (reference)
 * @param {!function} routeHandler Route handler (controller). If the application type specified is "WebAPI", the return must be a Promise
 * @param {{handlerParams: {}, methods: string|...string, handlesEndOfResponse: boolean}} options Additional options for the handler
 */
myMapper.prototype.addRoute = (routeName, routeHandler, options = { handlerParams: null, methods: "*", handlesEndOfResponse: false }) => {
    if (typeof routeName !== "string")
        throw new Error(`A string was expected for the first parameter (routeName). "${typeof routeName}" given.`);

    if (typeof routeHandler !== "function")
        throw new Error(`A function was expected for the second parameter (routeHandler). "${typeof routeHandler}" given.`);
    
    const allowedOptions = [
        "handlerParams",
        "methods",
        "handlesEndOfResponse"
    ];

    for (var a in options)
        if (allowedOptions.indexOf(a) === -1)
            throw new Error(`Unknown option given: "${a}".`);

    var typeOfMethods = typeof options.methods;

    if (options.methods === "*" || options.methods === undefined)
        options.methods = allowedMethods;
    else
        switch(typeOfMethods)
        {
            case "string":
            case "object":
                if (typeOfMethods === "string")
                    options.methods = options.methods.trim().toLowerCase().split(",");

                else if (typeOfMethods === "object")
                    if (!options.methods.indexOf)
                        throw new Error(`A string or string[] was expected for the property <options.methods>. "${typeof options.methods}" given.`);
                    else
                        options.methods = options.methods.toString().toLowerCase().split(",");

                var filter = [];
                var doesNotExist = false;

                for(var a in options.methods)
                    if (doesNotExist = allowedMethods.indexOf(options.methods[a].trim()) === -1)
                        break;
                    else if (filter.indexOf(options.methods[a].trim()) === -1)
                        filter.push(options.methods[a].trim());

                if (doesNotExist)
                    throw new Error(`The given values for the property <options.methods> ("${options.methods}") are invalid. The allowed methods are "${allowedMethods}"`);

                options.methods = filter;
            break;

            default:
                throw new Error(`A string or string[] was expected for the property <options.methods>. "${typeof options.methods}" given.`);
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
        parameters: options.handlerParams,
        variables: processedVariables,
        methods: options.methods,
        rawName: routeName,
        handlesEndOfResponse: options.handlesEndOfResponse ? true: false
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
 * @param {{ request: IncomingMessage, response: ServerResponse }} context Current request and response
 */
myMapper.prototype.getRoute = (routeName, context) => {
    if (typeof routeName !== "string")
        throw new Error(`A string was expected for the first parameter (routeName). "${typeof routeName}" given.`);

    if (typeof context !== "object")
        throw new Error(`An object was expected for the second parameter (context). "${typeof context}" given.`);

    if (!context.hasOwnProperty("request"))
        throw new Error("The second parameter (context) must have a \"request\" property of type \"IncomingMessage\".");

    if (!context.hasOwnProperty("response"))
        throw new Error("The second parameter (context) must have a \"response\" property of type \"ServerResponse\".");

    // Remove initial, ending and repeated slashes
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

    const injectValues = (actionHandler) => {
        if (actionHandler.parameters === undefined)
            actionHandler.parameters = { __context: context, __variables: variables, __myMapper: self };
        else
        {
            actionHandler.parameters.__context = context;
            actionHandler.parameters.__variables = variables;
            actionHandler.parameters.__myMapper = self;
        }
    };

    if (!exists)
    {
        context.response.writeHead(404, {
            'Content-Type': 'text/html'
        });

        if (notFoundHandler)
        {
            injectValues(notFoundHandler);
            notFoundHandler.handler(notFoundHandler.parameters);
        }

        context.response.end();
        return false;
    }

    self.lastMappedRoute =
    context["currentMapping"] = mapper[routeAlias];

    injectValues(mapper[routeAlias]);

    if (instanceType === applicationTypes.WebSite)
    {
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
            injectValues(headerHandler);
            headerHandler.handler(headerHandler.parameters);
        }

        if (context.response.statusCode >= 400 && self.showhandlersContentOnStatusCodeNotOK === false)
        {
            context.response.end();
            return false;
        }
        
        var result = mapper[routeAlias].handler(mapper[routeAlias].parameters);
    
        if (!mapper[routeAlias].handlesEndOfResponse)
            if (!responseEndHandler)
            {
                if (!context.response.finished)
                    context.response.end();
            }
            else
            {
                injectValues(responseEndHandler);
                responseEndHandler.handler(responseEndHandler.parameters);
            }
    
        // Garantizar que se retorne un booleano
        return result === undefined || (result ? true: false);
    }
    else if (instanceType === applicationTypes.WebAPI)
    {
        if (setHeaderBeforeHandler)
        {
            if (context.response.headersSent)
                console.error(`Headers already sent. Skipping header handler for this request: "/${context.request.method} ${context.request.headers["host"]}${context.request.url}".`);

            if (!headerHandler)
            {
                var status = 200;
                
                if (mapper[routeAlias].methods !== undefined && mapper[routeAlias].methods.indexOf(context.request.method.toLowerCase()) === -1)
                    status = 405; // Not Allowed
    
                context.response.writeHead(status, {
                    'Content-Type': 'application/json'
                });
            }
            else
            {
                injectValues(headerHandler);
                headerHandler.handler(headerHandler.parameters);
            }
        }

        const handlerResult = mapper[routeAlias].handler(mapper[routeAlias].parameters);

        if (handlerResult === undefined || !handlerResult.then)
            console.error(`A Promise was expected to be returned from the handler. Skipping the subsequent handlers for this request: "/${context.request.method} ${context.request.headers["host"]}${context.request.url}".`);
        else
            handlerResult
                .then((result) => {
                    if (!setHeaderBeforeHandler)
                    {
                        if (context.response.headersSent)
                            console.error(`Headers already sent. Skipping header handler for this request: "/${context.request.method} ${context.request.headers["host"]}${context.request.url}".`);
                        
                        if (!headerHandler)
                        {
                            var status = 200;
                            
                            if (mapper[routeAlias].methods !== undefined && mapper[routeAlias].methods.indexOf(context.request.method.toLowerCase()) === -1)
                                status = 405; // Not Allowed
                
                            context.response.writeHead(status, {
                                'Content-Type': 'application/json'
                            });
                        }
                        else
                        {
                            injectValues(headerHandler);
                            headerHandler.handler(headerHandler.parameters);
                        }

                        if (context.response.statusCode >= 400 && self.showhandlersContentOnStatusCodeNotOK === false)
                            context.response.end();
                    }
                    
                    if (!context.response.finished)
                    {
                        if (typeof result === 'string')
                            try {
                                JSON.parse(result);
                            }
                            catch (ex) {
                                result = JSON.stringify(result);
                            }
                        else if (result !== undefined)
                            result = JSON.stringify(result);
                        
                        if (!responseEndHandler)
                            context.response.end(result);
                        else
                        {
                            if (result)
                                context.response.write(result);

                            injectValues(responseEndHandler);
                            responseEndHandler.handler(responseEndHandler.parameters);
                        }
                    }
                    else if (responseEndHandler)
                    {
                        injectValues(responseEndHandler);
                        responseEndHandler.handler(responseEndHandler.parameters);
                    }
                })
                .catch((reason) => {
                    console.log("Promise catch:", reason);

                    if (!context.response.finished)
                        context.response.end();
                });
    }

    return true;
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
