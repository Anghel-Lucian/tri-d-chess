import { Http2Stream } from "http2";
import {
    ParsedRequest, 
    ParsedRequestSignIn, 
    ParsedRequestLogIn, 
    ParsedRequestGuest, 
    ParsedRequestStats,
    RequestHeaders,
    HTTP_METHODS
} from "@api/types";
import AbstractRequestInterceptor from "@api/AbstractRequestInterceptor.js";
import { API_ROUTES } from "@api/constants/index.js";

/**
  * Class that parses stream and headers object to obtain data 
  * such as path, parameters, body, method. The collected data is 
  * returned as a unified request object with a specific interface
  * defined by the programmer.
  *
  * This class will only get valid API requests because of the filter before it:
  * RequestFilter
  */
export default class RequestParser extends AbstractRequestInterceptor {
    constructor(interceptor?: AbstractRequestInterceptor) {
        super(interceptor);
    }

    public onRequest(stream: Http2Stream, headers: RequestHeaders) {
        const path: string = headers[':path'];
        const method: string = headers[':method']; 

        console.log({method});
        let parsedRequest: ParsedRequest = null;

        if (path === API_ROUTES.SIGN_IN) {
            parsedRequest = this.onSignIn(stream, headers, path, method);
        } else if (path === API_ROUTES.LOG_IN) {
            parsedRequest = this.onLogIn(stream, headers, path, method);
        } else if (path === API_ROUTES.GUEST) {
            parsedRequest = this.onGuest(stream, headers, path, method);
        } else if (/stats\/[a-zA-Z0-9]*/.test(path)) {
            parsedRequest = this.onStats(stream, headers, path, method);
        }

        this.next(parsedRequest);
    }

    // TODO: actual implementation
    // TODO: the method should be an enum of HTTP_METHODS.GET or HTTP_METHODS.POST instead of a string, handle in onRequest
    private onSignIn(stream: Http2Stream, headers: RequestHeaders, path: string, method: string): ParsedRequestSignIn {
        const chunks: Buffer[] = [];
        let fullResponseBuffer: Buffer;
        stream
            .on('data', (chunk: Buffer) => chunks.push(chunk))
            .on('end', () => {
                fullResponseBuffer = Buffer.concat(chunks);
                const parsedRequest: ParsedRequestSignIn = {
                    path,
                    apiPath: API_ROUTES.SIGN_IN,
                    method,
                    body: JSON.parse(fullResponseBuffer.toString())
                };

                console.log({
                    fullResponseBuffer,
                    fullResponseBufferString: fullResponseBuffer.toString(),
                    fullResponseBufferJSON: JSON.parse(fullResponseBuffer.toString())
                });
            });

        return null;        
    }

    private onLogIn(stream: Http2Stream, headers: RequestHeaders, path: string, method: string): ParsedRequestLogIn {
        return null;
    }
    
    private onGuest(stream: Http2Stream, headers: RequestHeaders, path: string, method: string): ParsedRequestGuest {
        return null;
    }

    private onStats(stream: Http2Stream, headers: RequestHeaders, path: string, method: string): ParsedRequestStats {
        return null;
    }
}
