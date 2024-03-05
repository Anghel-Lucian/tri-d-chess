package main

import (
	"fmt"
	"io"
	"net/http"
    "errors"
)

// TODO: server sends updates even after the client is down, didn't test for more than 10 seconds to see what happens
// TODO: when receiving a request, how to identify what client to send an update to?
func main() {
    http.HandleFunc("/register-game", getHello);
    http.HandleFunc("/game-subscribe", gameSubscribe);

    serverPort := loadVariable("GAME_SERVER_PORT");
    err := http.ListenAndServe(":" + serverPort, nil);

    if errors.Is(err, http.ErrServerClosed) {
        fmt.Printf("Server closed\n");
    } else if err != nil {
        fmt.Printf("Error starting server at port: %s. Reason: %s\n", serverPort, err);
    }
}

func getHello(w http.ResponseWriter, r *http.Request) {
    fmt.Printf("Get hello called");
    io.WriteString(w, "Hello from game-server\n");
}

