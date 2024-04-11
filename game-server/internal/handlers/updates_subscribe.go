package handlers

import (
	"fmt"
	"math/rand"
	"net/http"
	"sync"
	"time"
    "context"
    "log"

	"game-server/internal/env"
	"game-server/internal/handlers/utils"
)
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
    requestCtx, cancelRequestCtx := context.WithTimeout(context.Background(), 5 * time.Second);
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

    _, ok := Subscribers.Load(gameId);

    if (!ok) {
        Subscribers.Store(gameId, map[string]*http.ResponseWriter{});
    }

    // TODO: if you get another request with the same playerId then stop sending updates to the
    // last one
    // TODO: ensure that updates are no longer sent if the connection times out or the connection closes
    // TODO: you probably have to queue events if you want your users not to lose anything in case
    // the connection falters. You have to handle the case where a user drops off, and then comes back up
    // TODO: evalutate if using channels instead of maps for storing the subscribers is better? I dont
    // think so. If we were to have an arbitrary number of events then maybe we could store the events
    // in channels, but we don't.
    gameEntry, _ := Subscribers.Load(gameId);
    gameEntryMap, _ := gameEntry.(map[string]*http.ResponseWriter);
    gameEntryMap[playerId] = &w;
    
    utils.SetDefaultHeaders(&w);
    w.Header().Set("Content-Type", "text/event-stream");
    w.Header().Set("Connection", "keep-alive");

    // TODO: for some reason events are sent even after the client closes the connection
    // find out why and how to solve it
    for {
        fmt.Printf("Sending update...\n");
        fmt.Fprintf(w, "%d\n", rand.Intn(100));
        w.(http.Flusher).Flush();
        time.Sleep(2 * time.Second);
    }
}

