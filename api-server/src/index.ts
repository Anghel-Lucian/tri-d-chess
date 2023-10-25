import {createSecureServer} from 'node:http2';
import { Stream } from 'node:stream';

import 'dotenv/config';

import Handler from './Handler';

const server = createSecureServer({
    key: process.env.PRIVATE_KEY_FILE_PATH,
    cert: process.env.CERT_FILE_PATH
});

server.on('error', (error: Error) => {
    Handler.onError(error);
});

server.on('stream', (stream: Stream, headers: Headers) => {
    Handler.onStream(stream, headers); 
});

server.listen(process.env.PORT);

