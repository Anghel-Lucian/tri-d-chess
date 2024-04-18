package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"player-queue/internal/env"
	"player-queue/internal/handlers/utils"
)

type GameSubscribersEntry struct {
    PlayerMap map[string]*http.ResponseWriter;
    SharedCtx context.Context; 
    CancelSharedCtx context.CancelFunc;
    ErrorCh chan error;
}

var Subscribers *sync.Map = &sync.Map{};

// TODO: Add a feature of making rooms and sharing the ID of a match, two frirends will be
// able to play with each other that way
// TODO: What will happen when an update is in-flight and a FinishGame request comes? Is that
// even possible in the first place?
// TODO: you need more validation in move.go handler, because you don't check a player
// has the right to make a move. I know its unlikely to happen and you can add validation for this
// in the client (like stopping movements until an update is received), but you still could
// do this for the safety
func UpdatesSubscribe(w http.ResponseWriter, r *http.Request) {
    queryParameters := r.URL.Query();

    gameId := queryParameters.Get("gameId");
    playerId := queryParameters.Get("playerId");

    if len(gameId) == 0 {
        BadRequest(&w, r, "[Game Subscribe] gameId is a required parameter", 0);
        return;
    }

    // TODO: does it matter in this case if we use a context with timeout? I'm asking
    // because we're keeping the connection alive to send events. But I don't think
    // it has to do with anything, because this is only the request to register a subscriber
    // not send the actual events (even though we do that now, it's just for testing)
    // TODO: do we want to cancel the requestCtx after this returns? Or do we want to keep it
    // in our map with the subcribers?
    requestCtx, cancelRequestCtx := context.WithCancel(context.Background());
    defer cancelRequestCtx();

    gameExists, err := env.LocalEnv.DB.GameExists(requestCtx, gameId);

    if err != nil {
        log.Printf("[Game Subscribe] error when checking if game exists: %v", err);
        BadRequest(&w, r, "[Game Subscribe] error when checking if game exists", http.StatusInternalServerError);
        return;
    }

    if !gameExists {
        BadRequest(&w, r, "[Game Subscribe] game does not exist", http.StatusNotFound);
        return;
    }

    if len(playerId) == 0 {
        BadRequest(&w, r, "[Game Subscribe] playerId is a required parameter", 0);
        return;
    }

    playerExists, err := env.LocalEnv.DB.PlayerExists(requestCtx, playerId);

    if err != nil {
        log.Printf("[Game Subscribe] error when checking if player exists: %v", err);
        BadRequest(&w, r, "[Game Subscribe] error when checking if player exists", http.StatusInternalServerError);
        return;
    }

    if !playerExists {
        BadRequest(&w, r, "[Game Subscribe] player does not exist", http.StatusNotFound);
        return;
    }

    _, ok := Subscribers.Load(gameId);

    if (!ok) {
        sharedCtx, cancelSharedCtx := context.WithCancel(context.Background());

        entry := GameSubscribersEntry{
            PlayerMap: map[string]*http.ResponseWriter{},
            SharedCtx: sharedCtx,
            CancelSharedCtx: cancelSharedCtx,
            ErrorCh: make(chan error),
        }

        Subscribers.Store(gameId, entry);
    }

    // TODO: if you get another request with the same playerId then stop sending updates to the
    // last one
    // TODO: ensure that updates are no longer sent if the connection times out or the connection closes
    // TODO: you probably have to queue events if you want your users not to lose anything in case
    // the connection falters. You have to handle the case where a user drops off, and then comes back up
    entry, _ := Subscribers.Load(gameId);
    gameEntry, _ := entry.(GameSubscribersEntry);
    gameEntryMap := gameEntry.PlayerMap;
    gameEntryMap[playerId] = &w;
   
    utils.SetDefaultHeaders(&w);
    w.Header().Set("Content-Type", "text/event-stream");
    w.Header().Set("Connection", "keep-alive");

    // TODO: for some reason events are sent even after the client closes the connection
    // find out why and how to solve it
    err = SendAck(&w);

    if err != nil {
        delete(gameEntryMap, playerId);
        log.Printf("[Game Subscribe] error sending ACK event: %v", err);
        BadRequest(&w, r, "[Game Subscribe] could not ACK", http.StatusInternalServerError);
        return;
    }

    select {
    // This will cancel the goroutine for each subscriber
    case <-gameEntry.SharedCtx.Done():
        Subscribers.Delete(gameId);
        log.Printf("[Game Subscribe] context canceled. Deleting all writers for game %v", gameId);

        responsePayload := ResponsePayload{
            Message: "[Game Subscribe] closing all channels, updates finished",
        }

        json.NewEncoder(w).Encode(responsePayload);
        return;
    case <-gameEntry.ErrorCh:
        Subscribers.Delete(gameId);
        log.Printf("[Game Subscribe] error occurred while sending events. Closing connections");

        responsePayload := ResponsePayload{
            Message: "[Game Subscribe] error occurred when sending events. Closing all channels. Please resubscribe again",
        };

        w.WriteHeader(http.StatusInternalServerError);
        json.NewEncoder(w).Encode(responsePayload);
        return;
    }
}

