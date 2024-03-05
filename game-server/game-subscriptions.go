package main 

import (
    "fmt"
    "net/http"
    "time"
    "math/rand"
)

var gameSubscribers map[string]map[string]*http.ResponseWriter = map[string]map[string]*http.ResponseWriter{};

// TODO: you'll keep the connections (the responseWriter) in memory
// and you'll identify them per game ID. You'll have a map of {gameId: {player1Id: responseWriter...}}
func gameSubscribe(w http.ResponseWriter, r *http.Request) {
    queryParameters := r.URL.Query();

    gameId := queryParameters.Get("gameId");
    playerId := queryParameters.Get("playerId");

    if len(gameId) == 0 {
        handleBadRequest(&w, r, "[Game Subscribe] gameId is a required parameter", 0);
        return;
    }

    if len(playerId) == 0 {
        handleBadRequest(&w, r, "[Game Subscribe] playerId is a required parameter", 0);
        return;
    }

    // TODO: check if game with ID gameId actually exists
    if (len(gameSubscribers[gameId]) == 0) {
        gameSubscribers[gameId] = map[string]*http.ResponseWriter{};
    }

    // TODO: if you get another request with the same playerId then stop sending updates to the
    // last one
    // TODO: ensure that updates are no longer sent if the connection times out or the connection closes
    // TODO: you probably have to queue events if you want your users not to lose anything in case
    // the connection falters. You have to handle the case where a user drops off, and then comes back up
    gameSubscribers[gameId][playerId] = &w;

    setDefaultHeaders(&w);
    w.Header().Set("Content-Type", "text/event-stream");
    w.Header().Set("Connection", "keep-alive");

    for {
        fmt.Printf("Sending update...\n");
        fmt.Fprintf(w, "%d\n", rand.Intn(100));
        w.(http.Flusher).Flush();
        time.Sleep(2 * time.Second);
    }
}
