import {Http2Stream, createSecureServer} from 'node:http2';
import fs from 'node:fs';

import 'dotenv/config';

// TODO: use the parser, logger and sanitizer as well (sanitizer first, then logger, then parser)
import RequestHandler from '@api/RequestHandler.js';
import RequestParser from '@api/RequestParser.js';
import {RequestHeaders} from '@api/types';

const server = createSecureServer({
    key: fs.readFileSync(process.env.PRIVATE_KEY_FILE_PATH, 'utf8'),
    cert: fs.readFileSync(process.env.CERT_FILE_PATH, 'utf8')
});

const requestParser = new RequestParser();
const requestHandler = new RequestHandler();

requestParser.setNextInterceptor(requestHandler);

server.on('error', (error: Error) => {
    RequestHandler.onError(error);
});

server.on('request', (request, response) => {
    console.log("Processing request");

    requestParser.onRequest(request, response);
});

/*
server.on('stream', (stream: Http2Stream, headers: RequestHeaders) => {
    requestParser.onRequest(stream, headers); 
});
*/

console.log(`[api-server] listening on ${process.env.PORT}`);
server.listen(process.env.PORT);

