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
    Player1Id string `json:"player1Id"`
    Player2Id string `json:"player2Id"`
    GameId string `json:"gameId"`
}

// TODO: this function can't return until two players have been matched. The
// connection will be used to send an event saying that the queue has found a match for
// the player
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

            // TODO: you can attach a channel to each queue, and listen on that channel
            // for two elements. Source the queue from the pool before hand, based on the name.
            // Then, call SyncEnqueue and check the error (if any error, respond).
            // SyncEnqueue will push the player to the queue channel.
            // If another player is also in that channel, then you'll send an event via
            // the connection.
            // IDK if player1, player2 := <-qCh, <-qCh is a valid select case, we'll see.
            // If not, we can do a q channel that will hold pairs or players instead of
            // individual players

            // TODO: no, better to have a channel and a writer associated to each player
            // When pairing, send a signal to teh channels and a routine will write
            // the matching event to those writers
            // call the function here and it should block until the event is sent
            enqueuedPlayer := &player.QueuedPlayer{
                PlayerId: playerId,
                QueuedTimestamp: time.Now().Unix(),
                QueuedOn: "Public",
                Matched: make(chan string),
                Writer: &w,
            };

            err := playerqueuepool.SyncGetPlayerQueuePoolInstance(qCtx).SyncEnqueue(qCtx, "Public", enqueuedPlayer); 

            if err != nil {
                log.Printf("[Enqueue] Error when enqueueing: %v", err);
                BadRequest(&w, r, "[Enqueue] Error while enqueueing player", http.StatusInternalServerError);
                return;
            }

            //blockingSendQueuedUpdate(enqueuedPlayer);

            responsePayload = ResponsePayload{
                Message: "[Enqueue] Player enqueued successfully",
            };
            w.WriteHeader(http.StatusOK);
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

// TODO: you need to also create a game for the two queued players
// think you can do that in the playerqueuepool when sending the update to both players maybe
func blockingSendMatchedUpdate(enqueuedPlayer *player.QueuedPlayer) error {
    return nil;
}

