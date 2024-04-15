package handlers

import (
	"net/http"
	"sync"
    "encoding/json"
	"context"
	"log"

	"game-server/internal/env"
	"game-server/internal/handlers/utils"
)

type GameSubscribersEntry struct {
    PlayerMap map[string]*http.ResponseWriter;
    SharedCtx context.Context; 
    CancelSharedCtx context.CancelFunc;
}

var Subscribers *sync.Map = &sync.Map{};

// 1. Use syncMap instead of map
// 2. store the responseWriters into the map for each gameId/playerid combination
// 3. send first ACK event
// 4. when a move happens, look at the syncMap and send an update with the move
// 5. When finish game happens, delete the connections from syncMap

// TODO: you'll keep the connections (the responseWriter) in memory
// and you'll identify them per game ID. You'll have a map of {gameId: {player1Id: responseWriter...}}
// TODO: Add a feature of making rooms and sharing the ID of a match, two frirends will be
// able to play with each other that way
// TODO: What will happen when an update is in-flight and a FinishGame request comes? Is that
// even possible in the first place?
// TODO: I'm thinking that when a move happens, after we send the event to the client,
// the client has to  send and ACK back, and until then we keep the rows locked,
// and we also don't allow the other player from making a moveee. You can switch the turn
// when you receive an ACK
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
    }

    // TODO: create an error channel and put it in the GameSubscribersEntry struct.
    // Functions that send updates should push to it when an error occured when pushing
    // a new event or related to it
    select {
    case <-gameEntry.SharedCtx.Done():
        Subscribers.Delete(gameId);
        log.Printf("[Game Subscribe] context canceled. Deleting all writers for game %v", gameId);

        responsePayload := ResponsePayload{
            Message: "[Game Subscribe] closing all channels, updates finished",
        }

        json.NewEncoder(w).Encode(responsePayload);
        return;
    }
}
