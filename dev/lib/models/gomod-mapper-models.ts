import { IncomingMessage, ServerResponse } from "http";
import { GomodMapper } from "../require/gomod-mapper";


/**
 * Supported application types
 */
export enum MapperApplicationTypes {
    WebSite = 0,
    WebAPI = 1
}

export interface IMapperObjectType {
    [route: string]: IMapperObject | any; // Verificar force <------------------------------
} 

export type IMapperObject = IMapperObjectType & {
    handler?: Promise<any> | Function;
    parameters?: IMapperParameters;
    variables?: IMapperURLVariables[];
    methods?: Array<string>;
    handlesEndOfResponse?: boolean;
    rawName?: string;
}

export interface IMapperContext {
    request: IncomingMessage;
    response: ServerResponse;
}

export interface IMapperParameters {
    context: IMapperContext;
    parameters: {};
}

export interface IMapperURLVariables {
    raw: string;
    name: string;
    regex: string;
}

export interface IMapperHandler {
    handler: Function;
    parameters?: IMapperInjection
}

// export interface IMapperOptions {
//     handlerParams?: IMapperParameters;
//     methods: string | Array<string>;
//     handlesEndOfResponse?: boolean;
// }

export interface IMapperInjection {
    __context?: IMapperContext,
    __variables?: { [k: string]: string },
    __gomodMapper?: GomodMapper
};

export interface IMapperOptions {
    handlerParams?: { [k: string]: any };
    methods: string | Array<string>;
    handlesEndOfResponse?: boolean;
}
