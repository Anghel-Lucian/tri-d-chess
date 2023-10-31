import { Http2Stream } from "http2";

import {RequestHeaders} from "@api/types";

export default class RequestHandler {
    constructor() {

    }
    
    // TODO: create RequestSanitizer or RequestFilter class that makes sure the request is correct
    // and safe, or mark it as malicious or bad otherwise. If the request goes through the filter
    // then pass it to Handler class
    // TODO: create RequestParser class or method that parses a request's path, parameters and body
    // and passes it nicely as an object to Handler class
    // TODO: create a Logger class that will take care of all logging without cross-cutting concerns,
    // e.g., runs only on thrown errors or warnings or some special event
    public static onStream(stream: Http2Stream, headers: RequestHeaders): void {
        const path: string = headers[':path'];

        console.log(path);

        stream.end('<h1>Hello</h1');
    }

    public static onError(err: Error): void {

    }
}
