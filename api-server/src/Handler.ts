import { Stream } from "stream";

export default class Handler {
    constructor() {

    }

    public static onStream(stream: Stream, headers: Headers): void {
        const path = headers.get('path');

        console.log(path);
    }

    public static onError(err: Error): void {

    }
}
