import { Http2Stream } from "http2";
import {
    ParsedRequest, 
    ParsedRequestSignIn, 
    ParsedRequestLogIn, 
    ParsedRequestGuest, 
    ParsedRequestStats,
    RequestHeaders
} from "@api/types";

/**
  * Class that parses stream and headers object to obtain data 
  * such as path, parameters, body, method. The collected data is 
  * returned as a unified request object with a specific interface
  * defined by the programmer.
  *
  * This class will only get valid API requests because of the filter before it:
  * RequestFilter
  */
export default class RequestParser {
    constructor() {

    }

    public onStream(stream: Http2Stream, headers: RequestHeaders): ParsedRequest {
        const path: string = headers[':path'];
      
        let parsedRequest: ParsedRequest = null;

        if (path === '/sign-in') {
            parsedRequest = this.onSignIn(stream, headers, path);
        } else if (path === 'log-in') {
            parsedRequest = this.onLogIn(stream, headers, path);
        } else if (path === '/guest') {
            parsedRequest = this.onGuest(stream, headers, path);
        } else if (/stats\/[a-zA-Z0-9]*/.test(path)) {
            parsedRequest = this.onStats(stream, headers, path);
        }

        return parsedRequest;
    }

    // TODO: actual implementation
    private onSignIn(stream: Http2Stream, headers: RequestHeaders, path: string): ParsedRequestSignIn {
        stream.on('data', (...args) => {
            console.log(args);
        });
        return null;        
    }

    private onLogIn(stream: Http2Stream, headers: RequestHeaders, path: string): ParsedRequestLogIn {
        return null;
    }
    
    private onGuest(stream: Http2Stream, headers: RequestHeaders, path: string): ParsedRequestGuest {
        return null;
    }

    private onStats(stream: Http2Stream, headers: RequestHeaders, path: string): ParsedRequestStats {
        return null;
    }
}
