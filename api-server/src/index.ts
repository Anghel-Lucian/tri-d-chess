import {Http2Stream, createSecureServer} from 'node:http2';
import fs from 'node:fs';

import 'dotenv/config';

import Handler from './Handler.js';
import RequestHeaders from './types/request-headers.js';

const server = createSecureServer({
    key: fs.readFileSync(process.env.PRIVATE_KEY_FILE_PATH, 'utf8'),
    cert: fs.readFileSync(process.env.CERT_FILE_PATH, 'utf8')
});

server.on('error', (error: Error) => {
    Handler.onError(error);
});

server.on('stream', (stream: Http2Stream, headers: RequestHeaders) => {
    Handler.onStream(stream, headers); 
});

console.log(`[api-server] listening on ${process.env.PORT}`);
server.listen(process.env.PORT);

