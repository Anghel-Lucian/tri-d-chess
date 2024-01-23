package main

import (
	"fmt"
	"io"
	"net/http"
    "errors"
)

func main() {
    http.HandleFunc("/register-game", getHello);

    err := http.ListenAndServe(":8445", nil);

    if errors.Is(err, http.ErrServerClosed) {
        fmt.Printf("Server closed\n");
    } else if err != nil {
        fmt.Printf("error starting server: %s\n", err);
    }
}

func getHello(w http.ResponseWriter, r *http.Request) {
    fmt.Printf("Get hello called");
    io.WriteString(w, "Hello from game-server\n");
}
