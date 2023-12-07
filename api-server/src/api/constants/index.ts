export const APIS = {
    SIGN_IN: "sign-in",
    LOG_IN: "log-in",
    STATS: "stats",
    GUEST: "guest"
}

export const API_ROUTES = {
    SIGN_IN: "/" + APIS.SIGN_IN,
    LOG_IN: "/" + APIS.LOG_IN,
    STATS: "/" + APIS.STATS,
    GUEST: "/" + APIS.GUEST
}

export const API_ROUTES_REGEXES = {
    STATS: /stats\?[a-zA-Z0-9]*/
}

export enum HTTP_CODES {
    SUCCESS = 200,
    BAD_REQUEST = 400,
    BLACK_LISTED = 403,
    NOT_FOUND = 404,
    RESOURCE_ALREADY_EXISTS = 409,
    INTERNAL_ERROR = 500
}

export const HTTP_CODES_DESCRIPTIONS = {
    [HTTP_CODES.SUCCESS]: 'Successful request',
    [HTTP_CODES.BAD_REQUEST]: 'Bad request. Check OpenAPI specification',
    [HTTP_CODES.BLACK_LISTED]: '',
    [HTTP_CODES.NOT_FOUND]: 'Resource not found',
    [HTTP_CODES.RESOURCE_ALREADY_EXISTS]: 'Resource already exists',
    [HTTP_CODES.INTERNAL_ERROR]: 'Interval server error'
}

export const COMMON_RESPONSE_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=86400; includeSubDomains",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, HEAD",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Resource-Policy": "same-site",
    "Permissions-Policy": "geolocation=(), camera=(), microphone=()",
    "Server": "webserver",
    "Content-Type": "application/json; charset=utf-8"
}
