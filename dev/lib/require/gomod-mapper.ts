import { ServerResponse, IncomingMessage } from "http";
import { IMapperContext, IMapperHandler, IMapperObjectType, IMapperOptions, IMapperParameters, IMapperURLVariables, IMapperObject, MapperApplicationTypes } from "../models/gomod-mapper-models";

const fs = require("fs");


export class GomodMapper
{
    /**
     * Mapping dictionary
     */
    private mapper: IMapperObject;

    /**
     * Handler for not found requests
     */
    private notFoundHandler?: IMapperHandler;

    /**
     * Header handler for the valid requests
     */
    private headerHandler?: IMapperHandler;

    /**
     * End of response handler for valid requests
     */
    private responseEndHandler?: IMapperHandler;

    /**
     * Application type assigned for the current instance
     */
    private instanceType: MapperApplicationTypes;

    /**
     * Assign response header before the reponse handler is called
     */
    private setHeaderBeforeHandler: boolean;

    /**
     * Methods allowed for the incoming requests
     */
    private allowedMethods: Array<string>;

    /**
     * Load media from the given folder as any media extension is requested
     */
    public easyMediaMapping: boolean;

    /**
     * Root directory to load media from (default: "./public/images/")
     */
    public imageDirectory: string;

    /**
     * Show the content of the specified handler when the web response status code is not OK (>=400)
     */
    public showhandlersContentOnStatusCodeNotOK: boolean;

    /**
     * Gets the last routed request
     */
    public lastMappedRoute?: IMapperObject;
    

    constructor(applicationType: MapperApplicationTypes = MapperApplicationTypes.WebSite)
    {
        this.mapper = {};
        this.easyMediaMapping = true;
        this.instanceType = applicationType;
        this.setHeaderBeforeHandler = this.instanceType === MapperApplicationTypes.WebSite;
        this.imageDirectory = "./public/images/";
        this.showhandlersContentOnStatusCodeNotOK = false;

        this.allowedMethods = [
            "GET", "POST", "PUT",
            "PATCH", "DELETE", "COPY",
            "HEAD", "OPTIONS", "LINK",
            "UNLINK", "PURGE", "LOCK",
            "UNLOCK", "PROPFIND", "VIEW"
        ];
    }

    public GetMappedRoutes = () => {
        return this.mapper;
    };

    public SetHeaderBeforeHandler = (value: boolean = true) => {
        this.setHeaderBeforeHandler = value;
        return this;
    };

    /**
     * Set behavior when a resource is not found
     * @param routeHandler Route handler (controller)
     * @param paramDict Dictionary to send along with the "__context" property
     */
    public SetNotFound = (routeHandler: Function | null, paramDict?: {}) => {

        if (!routeHandler)
            this.notFoundHandler = undefined;
        else
            this.notFoundHandler = {
                handler: routeHandler,
                parameters: paramDict
            };

        return this;
    }

    /**
     * Set behavior and adding headers when a valid request is made
     * @param routeHandler Route handler (controller)
     * @param paramDict Dictionary to send along with the "__context" property
     */
    public SetHeaderHandler = (routeHandler: Function | null, paramDict?: {}) => {
        
        if (!routeHandler)
            this.headerHandler = undefined;
        else
            this.headerHandler = {
                handler: routeHandler,
                parameters: paramDict
            };

        return this;
    };

    /**
     * Set behavior for the end of the response when a valid request is made
     * @param routeHandler Route handler (controller)
     * @param paramDict Dictionary to send along with the "__context" property
     */
    public SetEndOfResponse = (routeHandler: Function | null, paramDict?: {}) => {
        
        if (!routeHandler)
            this.responseEndHandler = undefined;
        else
            this.responseEndHandler = {
                handler: routeHandler,
                parameters: paramDict
            };

        return this;
    }

    /**
     * Add new reference route to the project
     * @param routeName Route name (reference)
     * @param routeHandler Route handler (controller). If the application type specified is "WebAPI", the return must be a Promise
     * @param options Additional options for the handler
     */
    public AddRoute = (routeName: string, routeHandler: Function, options: IMapperOptions = { methods: "*", handlesEndOfResponse: false }) => {

        options.handlesEndOfResponse = options.handlesEndOfResponse === undefined ? false: options.handlesEndOfResponse;
        
        if (options.methods === "*")
            options.methods = this.allowedMethods;
        else
        {
            if (typeof options.methods === "string")
                options.methods = options.methods.split(",");

                options.methods = options.methods
                .map((method) => {
                    return method.trim().toUpperCase()
                })
                .reduce((obj, method) => {
                    if (obj.indexOf(method) === -1)
                        obj.push(method);
                    return obj;
                }, [] as string[]);


            const unregisteredMethod = options.methods.find((method) => {
                return this.allowedMethods.indexOf(method) === -1
            });
            
            if (unregisteredMethod)
                throw new Error(`The given values for the property <options.methods> ("${options.methods}") are invalid. The allowed methods are "${this.allowedMethods}"`);
        }

        // Quitar slashes iniciales, finales y los duplicados
        // routeName = routeName.replace(/(^\/+|(?<=\/)\/{1,}|\/+$)/g, "").trim().toLowerCase();
        routeName = routeName.replace(/\/{1,}/g, "/").replace(/(^\/+|\/+$)/g, "").trim();

        let variables = routeName.match(/\?\{\w[\w\d]*(:([^\{\}]+|[^\{\}]*\{.+\}[^\{\}]*))*\}/g);
        let processedVariables: IMapperURLVariables[] | undefined = new Array;

        if (this.mapper[routeName.toLowerCase()])
            throw new Error(`The given route name is already registered ("${routeName}")`);

        if (variables)
            for (var a in variables)
            {
                let clean = variables[a].substring(2, variables[a].length - 1);
                let parts = clean.split(":", 2);

                let name = parts[0];
                let regex = parts[1];

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


        this.mapper[routeName.toLowerCase()] = {
            handler: routeHandler,
            parameters: options.handlerParams,
            variables: processedVariables,
            methods: options.methods,
            rawName: routeName,
            handlesEndOfResponse: options.handlesEndOfResponse
        };

        return this;
    };

    /**
     * Call the corresponding handler (controller) based on the request
     * @param routeName Route name (reference)
     * @param context Current request and response
     */
    public GetRoute = (routeName: string, context: IMapperContext) => {

        // Remove initial, ending and repeated slashes
        // routeName = routeName.replace(/(^\/+|(?<=\/)\/{1,}|\/+$)/g, "").trim().toLowerCase();
        routeName = decodeURI(routeName.replace(/\/{1,}/g, "/").replace(/(^\/+|\/+$)/g, "").trim());
        
        // Alias to use in case a complex URL is used
        var routeAlias = routeName.toLowerCase();

        if (this.easyMediaMapping && this.LoadEasyMedia(routeName, context))
            return true;

        let exists = this.mapper.hasOwnProperty(routeAlias);
        let variables: { [k: string]: string } | undefined = undefined;

        if (!exists)
        {
            let routesWithVariables: IMapperObjectType = {};
            let containsComplexURL = false;

            for (let a in this.mapper)
                if (a.indexOf("?") !== 1 && this.mapper[a]!.variables.length > 0)
                {
                    containsComplexURL = true;
                    routesWithVariables[a] = this.mapper[a];
                }

            if (containsComplexURL)
                for (let a in routesWithVariables)
                {
                    let constructedRegex = routesWithVariables[a].rawName;

                    for (let b in routesWithVariables[a].variables)
                        constructedRegex = constructedRegex.replace (
                            routesWithVariables[a].variables[b].raw,
                            routesWithVariables[a].variables[b].regex === undefined ? "[^\/]+": routesWithVariables[a].variables[b].regex
                        );

                    constructedRegex = "^" + constructedRegex + "$";

                    
                    if (exists = routeName.match(new RegExp(constructedRegex)) ? true: false)
                    {
                        variables = {};

                        for (let b in routesWithVariables[a].variables)
                        {
                            let blockRegex = routesWithVariables[a].rawName.replace (
                                routesWithVariables[a].variables[b].raw,
                                ")" + (routesWithVariables[a].variables[b].regex === undefined ? "[^\/]+": routesWithVariables[a].variables[b].regex) + "(?="
                            );

                            for (let c in routesWithVariables[a].variables)
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

                            let regexResult = routeName.match(new RegExp(blockRegex));

                            regexResult = regexResult!.filter((value, index, self) => {
                                return value !== "";
                            });

                            variables[routesWithVariables[a].variables[b].name] = regexResult[regexResult.length - 1];
                        }

                        routeAlias = a;

                        break;
                    }
                }
        }

        const injectValues = (actionHandler: IMapperHandler) => {
            if (actionHandler.parameters === undefined)
                actionHandler.parameters = {
                    __context: context,
                    __variables: variables,
                    __gomodMapper: this
                };
            else
            {
                actionHandler.parameters.__context = context;
                actionHandler.parameters.__variables = variables;
                actionHandler.parameters.__gomodMapper = this;
            }
        };

        if (!exists)
        {
            context.response.writeHead(404, {
                'Content-Type': 'text/html'
            });

            if (this.notFoundHandler)
            {
                injectValues(this.notFoundHandler);
                this.notFoundHandler.handler(this.notFoundHandler.parameters);
            }

            context.response.end();
            return false;
        }

        this.lastMappedRoute = this.mapper[routeAlias];

        injectValues(this.mapper[routeAlias]);

        if (this.instanceType === MapperApplicationTypes.WebSite)
        {
            if (!this.headerHandler)
            {
                var status = 200;
                
                if (this.mapper[routeAlias].methods !== undefined && this.mapper[routeAlias].methods.indexOf(context.request.method) === -1)
                    status = 405; // Not Allowed

                context.response.writeHead(status, {
                    'Content-Type': 'text/html'
                });
            }
            else
            {
                injectValues(this.headerHandler);
                this.headerHandler.handler(this.headerHandler.parameters);
            }

            if (context.response.statusCode >= 400 && this.showhandlersContentOnStatusCodeNotOK === false)
            {
                context.response.end();
                return false;
            }
            
            var result = this.mapper[routeAlias].handler(this.mapper[routeAlias].parameters);
        
            if (!this.mapper[routeAlias].handlesEndOfResponse)
                if (!this.responseEndHandler)
                {
                    if (!context.response.finished)
                        context.response.end();
                }
                else
                {
                    injectValues(this.responseEndHandler);
                    this.responseEndHandler.handler(this.responseEndHandler.parameters);
                }
        
            // Garantizar que se retorne un booleano
            return result === undefined || (result ? true: false);
        }
        else if (this.instanceType === MapperApplicationTypes.WebAPI)
        {
            if (this.setHeaderBeforeHandler)
            {
                if (context.response.headersSent)
                    console.error(`Headers already sent. Skipping header handler for this request: "/${context.request.method} ${context.request.headers["host"]}${context.request.url}".`);

                if (!this.headerHandler)
                {
                    var status = 200;
                    
                    if (this.mapper[routeAlias].methods !== undefined && this.mapper[routeAlias].methods.indexOf(context.request.method) === -1)
                        status = 405; // Not Allowed
        
                    context.response.writeHead(status, {
                        'Content-Type': 'application/json'
                    });
                }
                else
                {
                    injectValues(this.headerHandler);
                    this.headerHandler.handler(this.headerHandler.parameters);
                }
            }

            if (this.mapper[routeAlias].methods.indexOf(context.request.method) === -1)
            {
                context.response.writeHead(405, {
                    'Content-Type': 'application/json'
                });

                context.response.end();

                return false;
            }

            let handlerResult;

            if (!context.response.headersSent)
                handlerResult = this.mapper[routeAlias].handler(this.mapper[routeAlias].parameters);

            if (handlerResult === undefined || !handlerResult.then)
                console.error(`A Promise was expected to be returned from the handler. Skipping the subsequent handlers for this request: "/${context.request.method} ${context.request.headers["host"]}${context.request.url}".`);
            else
                handlerResult
                    .then((result: any) => {
                        if (!this.setHeaderBeforeHandler)
                        {
                            if (context.response.headersSent)
                                console.error(`Headers already sent. Skipping header handler for this request: "/${context.request.method} ${context.request.headers["host"]}${context.request.url}".`);
                            
                            if (!this.headerHandler)
                            {
                                var status = 200;
                                
                                if (this.mapper[routeAlias].methods !== undefined && this.mapper[routeAlias].methods.indexOf(context.request.method) === -1)
                                    status = 405; // Not Allowed
                    
                                context.response.writeHead(status, {
                                    'Content-Type': 'application/json'
                                });
                            }
                            else
                            {
                                injectValues(this.headerHandler);
                                this.headerHandler.handler(this.headerHandler.parameters);
                            }

                            if (context.response.statusCode >= 400 && this.showhandlersContentOnStatusCodeNotOK === false)
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
                            
                            if (!this.responseEndHandler)
                                context.response.end(result);
                            else
                            {
                                if (result)
                                    context.response.write(result);

                                injectValues(this.responseEndHandler);
                                this.responseEndHandler.handler(this.responseEndHandler.parameters);
                            }
                        }
                        else if (this.responseEndHandler)
                        {
                            injectValues(this.responseEndHandler);
                            this.responseEndHandler.handler(this.responseEndHandler.parameters);
                        }
                    })
                    .catch((reason: Error) => {
                        console.log("Promise catch:", reason);

                        if (!context.response.finished)
                            context.response.end();
                    });
        }

        return true;
    };

    /**
     * Load specified media 
     * @param routeName Route name (reference)
     * @param context Current request and response
     */
    private LoadEasyMedia = (routeName: string, context: IMapperContext) => {
        if (this.mapper[routeName] || routeName.indexOf(".") === -1)
            return false;

        let folderName = "";
        let extensionName = routeName.substring(routeName.lastIndexOf(".") + 1).toLowerCase();

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
                    if (!fs.statSync(this.imageDirectory + routeName).isFile())
                        return false;
                }
                catch (ex){
                    if (ex.code === 'ENOENT')
                        return false;
                    else
                        throw ex;
                }

                var mimeResult = () => {
                    switch(extensionName)
                    {
                        case "jpg":
                            return "jpeg";

                        case "ico":
                            return "x-icon";

                        case "svg":
                            return "svg+xml";

                        default:
                            return extensionName;
                    }
                };
                
                
                context.response.writeHead(200, {
                    "Content-Type": "image/" + mimeResult()
                });
                
                break;

            default:
                return false;
        }

        var content = fs.readFileSync(this.imageDirectory + routeName);

        context.response.end(content, 'binary');

        return true;
    };
}

// module.exports = GomodMapper
export default GomodMapper;
