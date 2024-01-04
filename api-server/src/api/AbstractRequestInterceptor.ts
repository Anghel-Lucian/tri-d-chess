import { Http2ServerResponse } from "node:http2";

import { LOG_LEVEL } from "../constants.js";
import { HTTP_CODES, COMMON_RESPONSE_HEADERS } from "@api/constants/index.js";
import ResponseBody from "@api/ResponseBody.js";

/**
  * Used for chaining different kinds of interceptor to one single request.
  * E.g.: request to server goes through security filter, then parser, then handler.
  *
  * Similar to a Linked List node
  */
abstract class AbstractRequestInterceptor {
    protected nextInterceptor: AbstractRequestInterceptor;

    constructor(protected interceptor?: AbstractRequestInterceptor) {
        if (interceptor) {
            this.nextInterceptor = interceptor;
        }
    }

    public setNextInterceptor(interceptor: AbstractRequestInterceptor): AbstractRequestInterceptor {
        this.nextInterceptor = interceptor;

        return this.nextInterceptor;
    }

    // TODO: think whether it is better to create a general request
    // object to get as a parameter here and also pass it to onRequest in next() 
    abstract onRequest(...args: any[]): any;

    /**
      * Call the next interceptor. This method should be called in
      * each interceptor that needs to pass the request to some other
      * handler/handler/etc.
      *
      * The arbitrary arguments are passed to the onRequest method
      * to ensure the next interceptor has something to intercept...
      */
    protected next(...args: any[]): any {
        const result = this.nextInterceptor?.onRequest(...args);

        return result;
    }

    protected onError(
        err: Error, 
        response: Http2ServerResponse,
        statusCode?: number,
        message?: string,
        logLevel?: LOG_LEVEL
    ): void {
        switch (logLevel) {
            case LOG_LEVEL.ERROR:
                console.error(err);
                break;
            case LOG_LEVEL.WARN:
                console.warn(err);
                break;
            case LOG_LEVEL.INFO:
                console.log(err);
                break;
            default:
                console.error(err);
        }
        response.writeHead(statusCode || HTTP_CODES.INTERNAL_ERROR, COMMON_RESPONSE_HEADERS);
        response.end(new ResponseBody(message || 'Internal server error').toJSON());
    }
}

export default AbstractRequestInterceptor;
