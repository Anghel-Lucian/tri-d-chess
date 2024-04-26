package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"player-queue/internal/handlers/utils"
)

func BadRequest(w *http.ResponseWriter, r *http.Request, message string, code int) {
    log.Printf("[Player Queue]: Bad request. Message: %s\n", message);

    if (code != 0) {
        (*w).WriteHeader(code); 
    } else {
        (*w).WriteHeader(http.StatusBadRequest); 
    }
   
    responsePayload := ResponsePayload{
        Message: message,
    };

    utils.SetDefaultHeaders(w);
    json.NewEncoder(*w).Encode(responsePayload);
    return;
}

