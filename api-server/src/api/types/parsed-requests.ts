import { HTTP_METHODS } from "@api/types/index.js";

export interface ParsedRequestData {
    /**
      * Full path of the request (e.g., '/stats/{playerId}')
      */
    path: string,
    /**
      * Sanitized path relative to available APIs (e.g., '/stats' or '/guest')
      */
    api: string,
    method: HTTP_METHODS,
    parameters?: {[key: string]: string},
    body?: {[key: string]: any}
}

export interface ParsedRequestUserData extends ParsedRequestData {
    body: {
        id?: string,
        username?: string,
        email: string,
        password: string
    }
}

export interface ParsedRequestGuestData extends ParsedRequestData {
    body: {
        id?: string,
        username: string
    }
}

export interface ParsedRequestStatsData extends ParsedRequestData {
    parameters: {
        userId?: string,
        username?: string
    }
}
