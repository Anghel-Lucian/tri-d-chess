import { Http2ServerRequest, Http2ServerResponse } from "node:http2";

import AbstractRequestInterceptor from "@api/AbstractRequestInterceptor.js";

export default class RequestFilter extends AbstractRequestInterceptor {
    constructor(interceptor?: AbstractRequestInterceptor) {
        super(interceptor);
    }

    public onRequest(request: Http2ServerRequest, response: Http2ServerResponse) {
        
    }
}
