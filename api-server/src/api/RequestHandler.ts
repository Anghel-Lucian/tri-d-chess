import { Http2ServerRequest, Http2ServerResponse } from "node:http2";

import {ParsedRequestData} from "@api/types/index.js";
import {APIS, HTTP_METHODS} from "@api/constants/index.js";
import AbstractRequestInterceptor from "@api/AbstractRequestInterceptor.js";

export default class RequestHandler extends AbstractRequestInterceptor {
    constructor(interceptor?: AbstractRequestInterceptor) {
        super(interceptor);
    }
    
    // TODO: create RequestSanitizer or RequestFilter class that makes sure the request is correct
    // and safe, or mark it as malicious or bad otherwise. If the request goes through the filter
    // then pass it to Handler class
    // TODO: create a Logger class that will take care of all logging without cross-cutting concerns,
    // e.g., runs only on thrown errors or warnings or some special event
    public onRequest(requestData: ParsedRequestData, request: Http2ServerRequest, response: Http2ServerResponse): void {
        const {apiPath, method, body, parameters} = requestData;

        if (apiPath === APIS.SIGN_IN) {
            if (method === HTTP_METHODS.POST) {
                
            }
        }



        response.end('<h1>Hello from request handler</h1>');

        return;
    }

    public static onError(err: Error): void {

    }
}
