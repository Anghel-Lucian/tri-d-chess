package main

import "net/http"

func setDefaultHeaders(w *http.ResponseWriter) {
    (*w).Header().Set("X-Content-Type-Options", "nosniff"); 
    (*w).Header().Set("Referrer-Policy", "strict-origin-when-cross-origin");
    (*w).Header().Set("Strict-Transport-Security", "max-age=86400; includeSubDomains");
    (*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD");
    (*w).Header().Set("Cross-Origin-Opener-Policy", "same-origin");
    (*w).Header().Set("Cross-Origin-Embedder-Policy", "require-corp");
    (*w).Header().Set("Cross-Origin-Resource-Policy", "same-site");
    (*w).Header().Set("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
    (*w).Header().Set("Server", "webserver");
    (*w).Header().Set("Content-Type", "application/json; charset=utf-8");
}

