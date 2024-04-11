package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"game-server/internal/env"
	"game-server/internal/handlers/utils"
	"game-server/internal/models"
)

func Move(w http.ResponseWriter, r *http.Request) {
    var move models.Move;

    err := json.NewDecoder(r.Body).Decode(&move);

    if err != nil {
        log.Printf("[Move] Error reading move payload");
        BadRequest(&w, r, "[Move] Error reading move payload", http.StatusInternalServerError);
        return;
    }

    requestCtx, cancelRequestCtx := context.WithTimeout(context.Background(), 5 * time.Second);
    defer cancelRequestCtx();

    err = env.LocalEnv.DB.SwitchTurn(requestCtx, move.GameId);

    if err != nil {
        log.Printf("[Move] Error while switching turn");
        BadRequest(&w, r, "[Move] Error while switching turn", http.StatusInternalServerError);
        return;
    }

    responsePayload := ResponsePayload{
        Message: "[Move] Stored successfully, changing turn",
    }

    utils.SetDefaultHeaders(&w); 
    w.WriteHeader(http.StatusOK);
    json.NewEncoder(w).Encode(responsePayload);
    return;
}
