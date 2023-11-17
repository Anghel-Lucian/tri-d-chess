import {createSecureServer} from 'node:http2';
import fs from 'node:fs';

import 'dotenv/config';

import RequestHandler from '@api/RequestHandler.js';
import RequestParser from '@api/RequestParser.js';

import DBConnection from '@model/DBConnection.js';

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
    console.log('Processing request');
    const dbInstance = DBConnection.getInstance();
    dbInstance.createNewUser();
    requestParser.onRequest(request, response);
});

console.log(`[api-server] listening on ${process.env.PORT}`);
server.listen(process.env.PORT);

