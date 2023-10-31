export interface ParsedRequest {
    /**
      * Full path of the request (e.g., '/stats/{playerId}')
      */
    path: string,
    /**
      * Sanitized path relative to available APIs (e.g., '/stats' or '/guest')
      */
    apiPath: string,
    method: "GET" | "POST",
    parameters?: {[key: string]: string},
    body?: {[key: string]: any}
}

// TODO: interfaces for each type of request (sign-in, log-in, guest, stats, etc.)
export interface ParsedRequestSignIn extends ParsedRequest {

}

export interface ParsedRequestLogIn extends ParsedRequest {

}

export interface ParsedRequestGuest extends ParsedRequest {

}

export interface ParsedRequestStats extends ParsedRequest {

}
