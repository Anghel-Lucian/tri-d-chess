package handlers

import (
    "net/http"
    "log"
    "fmt"
    "io"
    "encoding/json"
    "context"
    "time"

    "game-server/internal/models"
    "game-server/internal/env"
)

func FinishGame(w http.ResponseWriter, r *http.Request) {
    var game models.FinishedActiveGame;

    err := json.NewDecoder(r.Body).Decode(&game);

    if err != nil {
        log.Printf("[Finish Game] Error when finishing game: %v", err);
    }

    requestCtx, cancelRequestCtx := context.WithTimeout(context.Background(), 5 * time.Second);
    defer cancelRequestCtx();

    fmt.Printf("Game: %v", game);

    env.LocalEnv.DB.FinishGame(requestCtx, game);

    io.WriteString(w, "finish game\n");
}

