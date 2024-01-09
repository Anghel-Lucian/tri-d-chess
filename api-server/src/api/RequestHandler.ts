import { Http2ServerRequest, Http2ServerResponse } from "node:http2";

import {ParsedRequestData, HTTP_METHODS} from "@api/types/index.js";
import {APIS, COMMON_RESPONSE_HEADERS, HTTP_CODES} from "@api/constants/index.js";
import AbstractRequestInterceptor from "@api/AbstractRequestInterceptor.js";
import ResponseBody from "@api/ResponseBody.js";
import Model from "@model/index.js";
import User from "@model/User.js";
import Guest from "@model/Guest.js";
import Stats from "@model/Stats.js";
import Game from "@model/Game.js";
import { LOG_LEVEL } from "../constants.js";

// TODO: handle DELETE cases and add the requests to the openAPI spec
// TODO: implement deletion of Guest accounts after some point
// TODO: generate a CSRF token on log in and on sign in and check if the client sends it after
// each subsequent request (stats, games, etc.)
// TODO: blacklisting of IPs that make too many requests
// TODO: access control with the CORS headers
// TODO: don't expose id's and passwords in the responses (update OpenAPI spec)
// TODO: keep track of the devices that the user is logged into at the same time
// TODO: encryption for passwords and emails
export default class RequestHandler extends AbstractRequestInterceptor {
    private model: Model;

    constructor(interceptor?: AbstractRequestInterceptor) {
        super(interceptor);

        this.model = Model.getInstance();
    }
    
    // TODO: create a Logger class that will take care of all logging without cross-cutting concerns,
    // e.g., runs only on thrown errors or warnings or some special event
    public async onRequest(requestData: ParsedRequestData, request: Http2ServerRequest, response: Http2ServerResponse): Promise<void> {
        console.log('[RequestHandler:onRequest]');
        const {api, method, body, parameters} = requestData;
        const responseBody = new ResponseBody('API not found. Check OpenAPI spec.');

        try {
            if (api === APIS.SIGN_IN) {
                if (method === HTTP_METHODS.POST) {
                    const {username, email, password} = body;
                    const existingUserWithEmail: User = await this.model.getUserByEmail(email);

                    if (existingUserWithEmail) {
                        this.onError(
                            new Error(`[RequestHandler:onRequest:${api}]: User with this email already exists`),
                            response,
                            HTTP_CODES.RESOURCE_ALREADY_EXISTS,
                            'User with given email already exists',
                            LOG_LEVEL.WARN
                        );
                        return null;
                    }

                    const existingUserWithUsername: User = await this.model.getUserByUsername(username);

                    if (existingUserWithUsername) {
                        this.onError(
                            new Error(`[RequestHandler:onRequest:${api}]: User with this username already exists`),
                            response,
                            HTTP_CODES.RESOURCE_ALREADY_EXISTS,
                            'User with given username already exists',
                            LOG_LEVEL.WARN
                        );
                        return null;
                    }

                    const user: User = await this.model.createNewUser(username, email, password);

                    if (!user) {
                        this.onError(
                            new Error(`[RequestHandler:onRequest:${api}]: User not inserted in DB`), 
                            response,
                            HTTP_CODES.INTERNAL_ERROR,
                            'Could not register user'
                        );
                        return;
                    }

                    responseBody.setData(user); 
                    responseBody.setMessage('Success. Created new user');
                }
            } else if (api === APIS.LOG_IN) {
                if (method === HTTP_METHODS.POST) {
                    const {email, password} = body;
                    const user: User = await this.model.getUserByEmailAndPassword(email, password);

                    if (!user) {
                        this.onError(
                            new Error(`[RequestHandler:onRequest:${api}]: User not found or invalid credentials`),
                            response,
                            HTTP_CODES.NOT_FOUND,
                            'Invalid credentials',
                            LOG_LEVEL.WARN
                        );
                        return;
                    }

                    responseBody.setData(user);
                    responseBody.setMessage('Success. User authenticated');
                }
            } else if (api === APIS.GUEST) {
                if (method === HTTP_METHODS.POST) {
                    const {username} = body;
                    const guest: Guest = await this.model.createGuest(username);

                    if (!guest) {
                        this.onError(
                            new Error(`[RequestHandler:onRequest:${api}]: Could not create Guest account`),
                            response,
                            HTTP_CODES.INTERNAL_ERROR,
                            'Could not create guest account'
                        );
                        return;
                    }

                    responseBody.setData(guest);
                    responseBody.setMessage('Success. Guest account created');
               }
            } else if (api === APIS.STATS) {
                if (method === HTTP_METHODS.GET) {
                    const {username, userId} = parameters;
                    let stats: Stats;

                    if (username) {
                        stats = await this.model.getStatsByUsername(username);
                    } else if (userId) {
                        stats = await this.model.getStatsByUserId(userId);
                    }

                    if (!stats) {
                        this.onError(
                            new Error(`[RequestHandler:onRequest:${api}]: Statistics not found for given user`),
                            response,
                            HTTP_CODES.NOT_FOUND,
                            'Statistics not found',
                            LOG_LEVEL.WARN
                        );
                        return;
                    }

                    responseBody.setData(stats);
                    responseBody.setMessage('Success. Statistics found');
                }
            } else if (api === APIS.GAMES) {
                if (method === HTTP_METHODS.POST) {
                    const {winnerId, loserId, forfeited} = body;

                    const winnerUser = await this.model.getUserById(winnerId);

                    if (!winnerUser) {
                        this.onError(
                            new Error(`[RequestHandler:onRequest:${api}]: user with winnerId not found`),
                            response,
                            HTTP_CODES.NOT_FOUND,
                            'User with given winnerId does not exist',
                            LOG_LEVEL.WARN
                        );
                        return null;
                    }

                    const loserUser = await this.model.getUserById(loserId);

                    if (!loserUser) {
                        this.onError(
                            new Error(`[RequestHandler:onRequest:${api}]: user with loserId not found`),
                            response,
                            HTTP_CODES.NOT_FOUND,
                            'User with given loserId does not exist',
                            LOG_LEVEL.WARN
                        );
                        return null;
                    }

                    const game: Game = await this.model.createFinishedGame(winnerId, loserId, forfeited);

                    if (!game) {
                        this.onError(
                            new Error(`[RequestHandler:onRequest:${api}]: Could not create finished game`),
                            response,
                            HTTP_CODES.INTERNAL_ERROR,
                            'Could not create finished game'
                        );
                        return;
                    }

                    responseBody.setData(game);
                    responseBody.setMessage('Success. Finished game created');
                }
            } else {
                response.writeHead(HTTP_CODES.NOT_FOUND, COMMON_RESPONSE_HEADERS);
                response.end(responseBody.toJSON());
                return;
            }

            response.writeHead(HTTP_CODES.SUCCESS, COMMON_RESPONSE_HEADERS);
            response.end(responseBody.toJSON());
        } catch (err) {
            this.onError(err, response);
        }

        return;
    }
}
