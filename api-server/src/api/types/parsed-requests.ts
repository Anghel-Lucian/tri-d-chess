import HTTP_METHODS from "@api/types/method-enum";

export interface ParsedRequestData {
    /**
      * Full path of the request (e.g., '/stats/{playerId}')
      */
    path: string,
    /**
      * Sanitized path relative to available APIs (e.g., '/stats' or '/guest')
      */
    apiPath: string,
    method: HTTP_METHODS,
    parameters?: {[key: string]: string},
    body?: {[key: string]: any}
}

// TODO: interfaces for each type of request (sign-in, log-in, guest, stats, etc.)
export interface ParsedRequestSignInData extends ParsedRequestData {

}

export interface ParsedRequestLogInData extends ParsedRequestData {

}

export interface ParsedRequestGuestData extends ParsedRequestData {

}

export interface ParsedRequestStatsData extends ParsedRequestData {

}
