package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"player-queue/internal/env"
	"player-queue/internal/handlers/utils"
	"player-queue/internal/player"
	"player-queue/internal/playerqueuepool"
)

type matchedEvent struct {
    GameId string `json:"gameId"`
}

func Enqueue(w http.ResponseWriter, r *http.Request) {
    queryParameters := r.URL.Query();

    playerId := queryParameters.Get("playerId");

    if len(playerId) == 0 {
        BadRequest(&w, r, "[Enqueue] playerId is a required parameter", 0);
        return;
    }

    requestCtx, cancelRequestCtx := context.WithTimeout(context.Background(), time.Second * 1);
    defer cancelRequestCtx();

    playerExistsCh, errCh := make(chan bool), make(chan error);

    go func() {
        playerExists, err := env.LocalEnv.DB.PlayerExists(requestCtx, playerId);

        if err != nil {
            errCh <- err;
        } else {
            playerExistsCh <- playerExists;
        }
    }()

    select {
    case playerExists := <-playerExistsCh:
        var responsePayload ResponsePayload;

        if playerExists {
            qCtx, cancelQCtx := context.WithCancel(context.Background());
            defer cancelQCtx();

            enqueuedPlayer := &player.QueuedPlayer{
                PlayerId: playerId,
                QueuedTimestamp: time.Now().Unix(),
                QueuedOn: "Public",
                Matched: make(chan string, 1),
                Writer: &w,
            };

            err := playerqueuepool.SyncGetPlayerQueuePoolInstance(qCtx).SyncEnqueue(qCtx, "Public", enqueuedPlayer); 

            if err != nil {
                log.Printf("[Enqueue] Error when enqueueing: %v", err);
                BadRequest(&w, r, "[Enqueue] Error while enqueueing player", http.StatusInternalServerError);
                return;
            }

            event := blockingSendMatchedUpdate(enqueuedPlayer);

            json.NewEncoder(w).Encode(event);
            flusher, _ := w.(http.Flusher);

            flusher.Flush();
            return;
        } else {
            responsePayload = ResponsePayload{
                Message: "[Enqueue] Player not found",
            };
            w.WriteHeader(http.StatusNotFound);
        }

        utils.SetDefaultHeaders(&w);
        json.NewEncoder(w).Encode(responsePayload);
    case err := <-errCh:
        log.Printf("[Enqueue] Error while querying DB for checking if player exists: %v", err);
        BadRequest(&w, r, "[Enqueue] Error while checking player", http.StatusInternalServerError);
        return;
    case <-requestCtx.Done():
        log.Printf("[Enqueue] Request timeout. Context error: %v", requestCtx.Err())
        BadRequest(&w, r, "[Enqueue] Request timeout", http.StatusRequestTimeout);
        return;
    }
}

func blockingSendMatchedUpdate(enqueuedPlayer *player.QueuedPlayer) matchedEvent {
    gameId := <-enqueuedPlayer.Matched; 

    responsePayload := matchedEvent{
        GameId: gameId,
    };

    return responsePayload;
}
