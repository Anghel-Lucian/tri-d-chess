package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"player-queue/internal/env"
	"player-queue/internal/handlers/utils"
)

func RegisterGame(w http.ResponseWriter, r *http.Request) {
    queryParameters := r.URL.Query();

    gameId := queryParameters.Get("gameId");

    if len(gameId) == 0 {
        BadRequest(&w, r, "[Register Game] gameId is a required parameter", 0);
        return;
    }

    requestCtx, cancelRequestCtx := context.WithTimeout(context.Background(), 5 * time.Second);
    defer cancelRequestCtx();

    gameExists, err := env.LocalEnv.DB.GameExists(requestCtx, gameId);

    if err != nil {
        log.Printf("[Register Game] Error while querying DB for checking existance of game");
        BadRequest(&w, r, "[Register Game] Error when checking game existence", 0);
        return;
    }

    var responsePayload ResponsePayload;

    if gameExists {
        ack := new(bool);
        *ack = true;

        responsePayload = ResponsePayload{
            Message: "[Register Game] Game exists",
            Ack: ack, 
        };
        w.WriteHeader(http.StatusOK)
    } else {
        ack := new(bool);
        *ack = false;

        responsePayload = ResponsePayload{
            Message: "[Register Game] Game does not exists",
            Ack: ack,
        };
        w.WriteHeader(http.StatusNotFound);
    }

    utils.SetDefaultHeaders(&w);
    json.NewEncoder(w).Encode(responsePayload);
    return;
}

