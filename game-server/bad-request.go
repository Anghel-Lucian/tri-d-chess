package main

import (
	"log"
	"net/http"
)

func handleBadRequest(w *http.ResponseWriter, r *http.Request, message string, code int) {
    log.Printf("[Game Server]: Bad request. Message: %s\n", message);

    if (code != 0) {
        (*w).WriteHeader(code); 
    } else {
        (*w).WriteHeader(http.StatusBadRequest); 
    }
    
    setDefaultHeaders(w);
    (*w).Header().Set("Content-Type", "text/plain");
    (*w).Write([]byte("Message: " + message));
    return;
}
