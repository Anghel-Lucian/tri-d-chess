import { Http2ServerRequest, Http2ServerResponse } from "http2";
import AbstractRequestInterceptor from "@api/AbstractRequestInterceptor.js";
import { 
    ParsedRequestData,
    ParsedRequestGuestData,
    ParsedRequestStatsData,
    ParsedRequestUserData,
    ParsedRequestGameData,
    HTTP_METHODS
} from "@api/types/index.js";
import { APIS, HTTP_CODES } from "@api/constants/index.js";
import { LOG_LEVEL } from "../constants.js";

export default class RequestValidator extends AbstractRequestInterceptor {
    constructor(interceptor?: AbstractRequestInterceptor) {
        super(interceptor);
    }

    public onRequest(parsedRequestData: ParsedRequestData, request: Http2ServerRequest, response: Http2ServerResponse): void {
        console.log('[RequestValidator:onRequest]');
        if (parsedRequestData.api === APIS.SIGN_IN && parsedRequestData.method === HTTP_METHODS.POST) {
            const userData = parsedRequestData as ParsedRequestUserData;

            if (!userData.body?.email
                || !userData.body?.username
                || !userData.body?.password) {
                    this.onBadRequest(
                        response, 
                        parsedRequestData.api, 
                        'Sign-in request body must contain email, username and password'
                    );
                    return;
                } 
        } else if (parsedRequestData.api === APIS.LOG_IN && parsedRequestData.method === HTTP_METHODS.POST) {
            const userData = parsedRequestData as ParsedRequestUserData;

            if (!userData.body?.email || !userData.body?.password) {
                this.onBadRequest(
                    response, 
                    parsedRequestData.api, 
                    'Log-in request body must contain email and password'
                );
                return;
            } 
        } else if (parsedRequestData.api === APIS.GUEST && parsedRequestData.method === HTTP_METHODS.POST) {
            const guestData = parsedRequestData as ParsedRequestGuestData;

            if (!guestData.body?.username) {
                this.onBadRequest(
                    response, 
                    parsedRequestData.api, 
                    'Guest creation request body must contain username'
                );
                return;
            }
        } else if (parsedRequestData.api === APIS.GAMES && parsedRequestData.method === HTTP_METHODS.POST) {
            const gameData = parsedRequestData as ParsedRequestGameData;

            if (!gameData.body?.winnerId 
                || !gameData.body?.loserId
                || typeof gameData.body?.forfeited !== 'boolean') {
                this.onBadRequest(
                    response, 
                    parsedRequestData.api, 
                    'Game request body must contain winnerId: string, loserId:string and forfeited:boolean fields'
                );
                return;
            } else if (gameData.body?.winnerId === gameData.body?.loserId) {
                this.onBadRequest(
                    response,
                    parsedRequestData.api,
                    'winnerId and loserId need to be distinct'
                );
                return;
            }
        } else if (parsedRequestData.api === APIS.STATS && parsedRequestData.method === HTTP_METHODS.GET) {
            const statsData = parsedRequestData as ParsedRequestStatsData;

            if (!statsData.parameters?.userId && !statsData.parameters?.username) {
                this.onBadRequest(
                    response, 
                    parsedRequestData.api, 
                    'Stats request parameters must have either userId or username'
                );
                return;
            }
        } 

        this.next(parsedRequestData, request, response);
    }

    private onBadRequest(response: Http2ServerResponse, api?: string, message?: string) {
        const responseMessage = message || 'Request does not conform to Open API specification';
        const errorString = `[RequestValidator:${api}]: ${responseMessage}`

        this.onError(
            new Error(errorString),
            response,
            HTTP_CODES.BAD_REQUEST,
            responseMessage,
            LOG_LEVEL.WARN
        );
    }
}
