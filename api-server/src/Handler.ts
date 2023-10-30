import { Http2Stream } from "http2";

import RequestHeaders from "./types/request-headers";

export default class Handler {
    constructor() {

    }

    public static onStream(stream: Http2Stream, headers: RequestHeaders): void {
        const path: string = headers[':path'];

        console.log(path);

        stream.end();
    }

    public static onError(err: Error): void {

    }
}
