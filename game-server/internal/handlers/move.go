package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"
    "fmt"

	"game-server/internal/env"
	"game-server/internal/handlers/utils"
	"game-server/internal/models"
)

// TODO: how do you ensure that moves can be sent by players only after
// both players have the same game state (i.e., they both received they updates via SSEs)
func Move(w http.ResponseWriter, r *http.Request) {
    var move models.Move;

    err := json.NewDecoder(r.Body).Decode(&move);

    fmt.Printf("Move: %v\n", move);
    move.Print();

    // TODO: validate if Move has all the correct fields, not empty and so on
    // might be that Decode does that for us, but I want to make sure
    if err != nil {
        log.Printf("[Move] Error reading move payload");
        BadRequest(&w, r, "[Move] Error reading move payload", http.StatusInternalServerError);
        return;
    }

    requestCtx, cancelRequestCtx := context.WithTimeout(context.Background(), 5 * time.Second);
    defer cancelRequestCtx();

    gameId := move.GameId;

    gameExists, err := env.LocalEnv.DB.GameExists(requestCtx, gameId);

    if err != nil {
        log.Printf("[Move] error when checking if game exists: %v", err);
        BadRequest(&w, r, "[Move] error when checking if game exists", http.StatusInternalServerError);
        return;
    }

    if !gameExists {
        BadRequest(&w, r, "[Move] game does not exist", http.StatusNotFound);
        return;
    }

    moverId := move.PlayerId;

    playerExists, err := env.LocalEnv.DB.PlayerExists(requestCtx, moverId);

    if err != nil {
        log.Printf("[Move] error when checking if player exists: %v", err);
        BadRequest(&w, r, "[Move] error when checking if player exists", http.StatusInternalServerError);
        return;
    }

    if !playerExists {
        BadRequest(&w, r, "[Move] player does not exist", http.StatusNotFound);
        return;
    }

    err = env.LocalEnv.DB.SwitchTurn(requestCtx, move.GameId);

    if err != nil {
        log.Printf("[Move] Error while switching turn");
        BadRequest(&w, r, "[Move] Error while switching turn", http.StatusInternalServerError);
        return;
    }

    entry, ok := Subscribers.Load(gameId);

    if !ok {
        log.Printf("[Move] Subscribers for the game not found");
        BadRequest(&w, r, "[Move] Subscribers for the game not found", http.StatusNotFound);
        return;
    }

    gameEntry, _ := entry.(GameSubscribersEntry);
    gameEntryMap := gameEntry.PlayerMap;

    for playerId, w := range gameEntryMap {
        if playerId != moverId {
            SendMove(w, &move);
        }
    }

    responsePayload := ResponsePayload{
        Message: "[Move] Stored successfully, changing turn",
    }

    utils.SetDefaultHeaders(&w); 
    w.WriteHeader(http.StatusOK);
    json.NewEncoder(w).Encode(responsePayload);
    return;
}
