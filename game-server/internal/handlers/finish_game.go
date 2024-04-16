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

func FinishGame(w http.ResponseWriter, r *http.Request) {
    var game models.FinishedActiveGame;

    err := json.NewDecoder(r.Body).Decode(&game);

    if err != nil {
        log.Printf("[Finish Game] Error when reading game: %v", err);
        BadRequest(&w, r, "[Finish Game] Error when reading game payload", http.StatusInternalServerError);
        return;
    }

    requestCtx, cancelRequestCtx := context.WithTimeout(context.Background(), 5 * time.Second);
    defer cancelRequestCtx();

    err = env.LocalEnv.DB.FinishGame(requestCtx, game);

    if err != nil {
        log.Printf("[Finish Game] Error when finishing game: %v", err);
        BadRequest(&w, r, "[Finish Game] Error when finishing game", http.StatusInternalServerError);
        return;
    }

    // Cancel the context used by the event publishers
    entry, _ := Subscribers.Load(game.GameId);
    gameEntry, _ := entry.(GameSubscribersEntry);

    gameEntry.CancelSharedCtx();

    responsePayload := ResponsePayload{
        Message: "[Finish Game] Finished successfully",
    }

    utils.SetDefaultHeaders(&w);
    w.WriteHeader(http.StatusOK);
    json.NewEncoder(w).Encode(responsePayload);
    return;
}

