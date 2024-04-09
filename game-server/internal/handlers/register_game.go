package handlers

import (
    "net/http"
    "fmt"
    "io"
    "context"
    "log"
    "time"

	"github.com/google/uuid"

    "game-server/internal/env"
)

func RegisterGame(w http.ResponseWriter, r *http.Request) {
    fmt.Printf("Get hello called");

    requestCtx, cancelRequestCtx := context.WithTimeout(context.Background(), 5 * time.Second);
    defer cancelRequestCtx();

    gameExists, err := env.LocalEnv.DB.GameExists(requestCtx, uuid.New().String());

    fmt.Printf("Game exists: %v\n", gameExists);

    if err != nil {
        log.Printf("[register-game] Error while querying DB for checking existance of game");
    }

    io.WriteString(w, "Hello from game-server\n");
}

