import { Http2ServerRequest, Http2ServerResponse } from "http2";

import { ParsedRequestData, HTTP_METHODS } from "@api/types/index.js";
import { APIS, API_ROUTES, API_ROUTES_REGEXES, HTTP_CODES } from "@api/constants/index.js";
import AbstractRequestInterceptor from "@api/AbstractRequestInterceptor.js";
import { LOG_LEVEL } from "../constants.js";

// TODO: create a generic method instead of all these on* methods, the only thing that
// varies are the messages, right? don't know if there are other particularities
/**
  * Class that parses request object to obtain data 
  * such as path, parameters, body, method. The collected data is 
  * returned as a unified request data object with a specific interface.
  *
  * This class will only get valid API requests because of the filter before it:
  * RequestFilter
  */
export default class RequestParser extends AbstractRequestInterceptor {
    constructor(interceptor?: AbstractRequestInterceptor) {
        super(interceptor);
    }

    public onRequest(request: Http2ServerRequest, response: Http2ServerResponse) {
        console.log('[RequestParser:onRequest]');
        const path: string = request.headers[':path'];
        const unparsedMethod: string = request.headers[':method']; 
        let method: HTTP_METHODS = HTTP_METHODS.GET;

        if (unparsedMethod?.toLowerCase() === "post") {
            method = HTTP_METHODS.POST;
        }

        try {
            if (path === API_ROUTES.SIGN_IN && method === HTTP_METHODS.POST) {
                this.onSignIn(request, response, path, method);
            } else if (path === API_ROUTES.LOG_IN && method === HTTP_METHODS.POST) {
                this.onLogIn(request, response, path, method);
            } else if (path === API_ROUTES.GUEST) {
                this.onGuest(request, response, path, method);
            } else if (path === API_ROUTES.GAMES && method === HTTP_METHODS.POST) {
                this.onGames(request, response, path, method);
            } else if (API_ROUTES_REGEXES.STATS.test(path) && method === HTTP_METHODS.GET) {
                this.onStats(request, response, path, method);
            }
        } catch (err) {
            this.onError(
                err,
                response,
                HTTP_CODES.INTERNAL_ERROR,
                'Internal error',
                LOG_LEVEL.ERROR
            );
        }
    }

    private onSignIn(request: Http2ServerRequest, response: Http2ServerResponse, path: string, method: HTTP_METHODS) {
        const chunks: Buffer[] = [];
        let fullResponseBuffer: Buffer;

        request 
            .on('data', (chunk: Buffer) => chunks.push(chunk))
            .on('end', () => {
                fullResponseBuffer = Buffer.concat(chunks);

                if (!fullResponseBuffer || !fullResponseBuffer.length) {
                    this.onError(
                        new Error(`[RequestParser:onSignIn:${APIS.SIGN_IN}]: Request body missing`),
                        response,
                        HTTP_CODES.BAD_REQUEST,
                        'You have to provide a request body',
                        LOG_LEVEL.WARN
                    );
                    return;
                }

                const parsedRequestData: ParsedRequestData = {
                    path,
                    api: APIS.SIGN_IN, 
                    method,
                    body: JSON.parse(fullResponseBuffer.toString())
                };

                return this.next(parsedRequestData, request, response);
            });
    }

    private onLogIn(request: Http2ServerRequest, response: Http2ServerResponse, path: string, method: HTTP_METHODS) {
        const chunks: Buffer[] = [];
        let fullResponseBuffer: Buffer;

        request 
            .on('data', (chunk: Buffer) => chunks.push(chunk))
            .on('end', () => {
                fullResponseBuffer = Buffer.concat(chunks);

                if (!fullResponseBuffer || !fullResponseBuffer.length) {
                    this.onError(
                        new Error(`[RequestParser:onSignIn:${APIS.LOG_IN}]: Request body missing`),
                        response,
                        HTTP_CODES.BAD_REQUEST,
                        'You have to provide a request body',
                        LOG_LEVEL.WARN
                    );
                    return;
                }

                const parsedRequestData: ParsedRequestData = {
                    path,
                    api: APIS.LOG_IN,
                    method,
                    body: JSON.parse(fullResponseBuffer.toString())
                };

                return this.next(parsedRequestData, request, response);
            });
    }
    
    private onGuest(request: Http2ServerRequest, response: Http2ServerResponse, path: string, method: HTTP_METHODS) {
        const chunks: Buffer[] = [];
        let fullResponseBuffer: Buffer;

        request 
            .on('data', (chunk: Buffer) => chunks.push(chunk))
            .on('end', () => {
                fullResponseBuffer = Buffer.concat(chunks);

                if (!fullResponseBuffer || !fullResponseBuffer.length) {
                    this.onError(
                        new Error(`[RequestParser:onSignIn:${APIS.GUEST}]: Request body missing`),
                        response,
                        HTTP_CODES.BAD_REQUEST,
                        'You have to provide a request body',
                        LOG_LEVEL.WARN
                    );
                    return;
                }

                const parsedRequestData: ParsedRequestData = {
                    path,
                    api: APIS.GUEST,
                    method,
                    body: JSON.parse(fullResponseBuffer.toString())
                };

                return this.next(parsedRequestData, request, response);
            });
    }

    private onGames(request: Http2ServerRequest, response: Http2ServerResponse, path: string, method: HTTP_METHODS) {
        const chunks: Buffer[] = [];
        let fullResponseBuffer: Buffer;

        request 
            .on('data', (chunk: Buffer) => chunks.push(chunk))
            .on('end', () => {
                fullResponseBuffer = Buffer.concat(chunks);

                if (!fullResponseBuffer || !fullResponseBuffer.length) {
                    this.onError(
                        new Error(`[RequestParser:onGames:${APIS.GAMES}]: Request body missing`),
                        response,
                        HTTP_CODES.BAD_REQUEST,
                        'You have to provide a request body',
                        LOG_LEVEL.WARN
                    );
                    return;
                }

                const parsedRequestData: ParsedRequestData = {
                    path,
                    api: APIS.GAMES,
                    method,
                    body: JSON.parse(fullResponseBuffer.toString())
                };

                return this.next(parsedRequestData, request, response);
            });
    }

    private onStats(request: Http2ServerRequest, response: Http2ServerResponse, path: string, method: HTTP_METHODS) {
        request 
            .on('data', () => {}) // 'end' event will not fire if there's no handler for the 'data' event
            .on('end', () => {
                const stringParameters = path.slice(path.indexOf('?') + 1).split('&');
                const parsedParameters: {[key: string]: string} = {};

                for (const parameter of stringParameters) {
                    const [name, value] = parameter.split('=');

                    parsedParameters[name] = value;
                }

                const parsedRequestData: ParsedRequestData = {
                    path,
                    api: APIS.STATS,
                    method,
                    parameters: parsedParameters
                };

                return this.next(parsedRequestData, request, response);
            });
    }
}
