package main

import (
    "net/http"
)

func registerGame(w http.ResponseWriter, r *http.Request) {
    queryParameters := r.URL.Query();

    gameId := queryParameters.Get(QUERY_PARAMETER_NAMES["GAME_ID"]);

    if len(gameId) == 0 {
        handleBadRequest(&w, r, "[Game Register] gameId is a required parameter", 0);
    }


}
