const DEFAULT_RESPONSE_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=86400; includeSubDomains",
    "Access-Control-Allow-Methods": "GET, OPTIONS, HEAD",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Resource-Policy": "same-site",
    "Permissions-Policy": "geolocation=(), camera=(), microphone=()",
    "Server": "webserver"
};

export {DEFAULT_RESPONSE_HEADERS};

