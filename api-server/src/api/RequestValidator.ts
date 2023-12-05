import { Http2ServerRequest, Http2ServerResponse } from "http2";
import AbstractRequestInterceptor from "@api/AbstractRequestInterceptor.js";
import { 
    ParsedRequestData,
    ParsedRequestGuestData,
    ParsedRequestStatsData,
    ParsedRequestUserData,
    HTTP_METHODS
} from "@api/types/index.js";
import { APIS, HTTP_CODES } from "@api/constants/index.js";

export default class RequestValidator extends AbstractRequestInterceptor {
    constructor(interceptor?: AbstractRequestInterceptor) {
        super(interceptor);
    }

    public onRequest(parsedRequestData: ParsedRequestData, request: Http2ServerRequest, response: Http2ServerResponse): void {
        console.log('[RequestValidator:onRequest]');
        if ((parsedRequestData.api === APIS.SIGN_IN && parsedRequestData.method === HTTP_METHODS.POST)
           || (parsedRequestData.api === APIS.LOG_IN && parsedRequestData.method === HTTP_METHODS.POST)) {
            const userData = parsedRequestData as ParsedRequestUserData;

            if (!userData.body?.email
                || !userData.body?.username
                || !userData.body?.firstName
                || !userData.body?.lastName
                || !userData.body?.password) {
                    this.onBadRequest(request, response, parsedRequestData.api);
                } 
        } else if (parsedRequestData.api === APIS.GUEST && parsedRequestData.method === HTTP_METHODS.POST) {
            const guestData = parsedRequestData as ParsedRequestGuestData;

            if (!guestData.body?.username) {
                this.onBadRequest(request, response, parsedRequestData.api);
            }
        } else if (parsedRequestData.api === APIS.STATS && parsedRequestData.method === HTTP_METHODS.GET) {
            const statsData = parsedRequestData as ParsedRequestStatsData;

            if (!statsData.parameters?.userId) {
                this.onBadRequest(request, response, parsedRequestData.api);
            }
        }

        this.next(parsedRequestData, request, response);
    }

    private onBadRequest(request: Http2ServerRequest, response: Http2ServerResponse, api?: string, message?: string) {
        const logString = message || `[RequestValidator:${api}]: Request does not conform to OpenAPI specification.`
        console.log(logString);
        response.writeHead(HTTP_CODES.BAD_REQUEST);
        response.end(logString);
    }
}
