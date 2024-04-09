package handlers

import (
   "net/http"
   "log"
   "context"
   "io"
   "time"

   "game-server/internal/env"
   "game-server/internal/handlers/utils"
)

func Move(w http.ResponseWriter, r *http.Request) {
    queryParameters := r.URL.Query();

    gameId := queryParameters.Get("gameId");

    if len(gameId) == 0 {
        utils.BadRequest(&w, r, "[Move] gameId is a required parameter", 0);
        return;
    }

    requestCtx, cancelRequestCtx := context.WithTimeout(context.Background(), 5 * time.Second);
    defer cancelRequestCtx();

    err := env.LocalEnv.DB.SwitchTurn(requestCtx, gameId);

    if err != nil {
        log.Printf("[move] Error while switching turn");
    }

    io.WriteString(w, "Move it move it\n");
}
