import {createSecureServer} from 'node:http2';
import fs from 'node:fs';

import 'dotenv/config';

// TODO: generate a session_id cookie on log in and store it in sessions
import RequestParser from '@api/RequestParser.js';
import RequestValidator from '@api/RequestValidator.js';
import RequestHandler from '@api/RequestHandler.js';

import DBConnection from '@model/DBConnection.js';

const server = createSecureServer({
    key: fs.readFileSync(process.env.PRIVATE_KEY_FILE_PATH, 'utf8'),
    cert: fs.readFileSync(process.env.CERT_FILE_PATH, 'utf8')
});

const requestParser = new RequestParser();
const requestValidator = new RequestValidator();
const requestHandler = new RequestHandler();

requestParser
    .setNextInterceptor(requestValidator)
    .setNextInterceptor(requestHandler);

server.on('error', (error: Error) => {
    console.error(error);
});

server.on('request', async (request, response) => {
    console.log('Processing request');
    requestParser.onRequest(request, response);
});

console.log(`[api-server] listening on ${process.env.PORT}`);
server.listen(process.env.PORT);

function gracefulShutdown(signal: string) {
    console.info(`[api-server] ${signal} signal received`);
    console.log('[api-server] Shutting down HTTP server');
    server.close(async () => {
        console.log('[api-server] HTTP server shut down');

        console.log('[api-server] Closing DB connections');
        await DBConnection.getInstance().closeConnections();
        console.log('[api-server] DB connections closed');
    });
}

process.on('SIGTERM', gracefulShutdown.bind(null, 'SIGTERM'));
process.on('SIGINT', gracefulShutdown.bind(null, 'SIGINT'));
