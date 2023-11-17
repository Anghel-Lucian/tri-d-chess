import { Http2ServerRequest, Http2ServerResponse } from "http2";
import {
    ParsedRequestSignInData, 
    ParsedRequestLogInData, 
    ParsedRequestGuestData, 
    ParsedRequestStatsData
} from "@api/types/index.js";
import { APIS, API_ROUTES, HTTP_METHODS } from "@api/constants/index.js";
import AbstractRequestInterceptor from "@api/AbstractRequestInterceptor.js";

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
        const path: string = request.headers[':path'];
        const unparsedMethod: string = request.headers[':method']; 
        let method: HTTP_METHODS = HTTP_METHODS.GET;

        if (unparsedMethod?.toLowerCase() === "post") {
            method = HTTP_METHODS.POST;
        }

        if (path === API_ROUTES.SIGN_IN && method === HTTP_METHODS.POST) {
            this.onSignIn(request, response, path, method);
        } else if (path === API_ROUTES.LOG_IN && method === HTTP_METHODS.POST) {
            this.onLogIn(request, response, path, method);
        } else if (path === API_ROUTES.GUEST) {
            this.onGuest(request, response, path, method);
        } else if (/stats\?[a-zA-Z0-9]*/.test(path) && method === HTTP_METHODS.GET) {
            this.onStats(request, response, path, method);
        }
    }

    private onSignIn(request: Http2ServerRequest, response: Http2ServerResponse, path: string, method: HTTP_METHODS) {
        const chunks: Buffer[] = [];
        let fullResponseBuffer: Buffer;

        request 
            .on('data', (chunk: Buffer) => chunks.push(chunk))
            .on('end', () => {
                fullResponseBuffer = Buffer.concat(chunks);
                const parsedRequestData: ParsedRequestSignInData = {
                    path,
                    apiPath: APIS.SIGN_IN, 
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
                const parsedRequestData: ParsedRequestLogInData = {
                    path,
                    apiPath: APIS.LOG_IN,
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
                const parsedRequestData: ParsedRequestGuestData = {
                    path,
                    apiPath: APIS.GUEST,
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
                    const [name, _, value] = parameter.split('=');

                    parsedParameters[name] = value;
                }

                const parsedRequestData: ParsedRequestStatsData = {
                    path,
                    apiPath: APIS.STATS,
                    method,
                    parameters: parsedParameters
                };

                return this.next(parsedRequestData, request, response);
            });
    }
}
