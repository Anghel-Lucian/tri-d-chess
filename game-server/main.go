package main

import (
	"context"
	"errors"
	"flag"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"game-server/internal/env"
	"game-server/internal/handlers"
)

// TODO: server sends updates even after the client is down, didn't test for more than 10 seconds to see what happens
// TODO: when receiving a request, how to identify what client to send an update to?
func main() {
    flag.BoolVar(&env.LocalEnv.DevelopmentRun, "dev", false, "Start the server in development mode");

    flag.Parse();

    serverPort := env.LoadVariable("GAME_SERVER_PORT");

    server := &http.Server{
        Addr: serverPort,
    };

    http.HandleFunc("/register-game", handlers.RegisterGame);
    http.HandleFunc("/updates-subscribe", handlers.AuthCheckDecorator(handlers.UpdatesSubscribe));
    http.HandleFunc("/move", handlers.AuthCheckDecorator(handlers.Move));
    http.HandleFunc("/finish-game", handlers.FinishGame);

    go func() {
        err := env.InitEnv();

        if err != nil {
            log.Fatalf("Error when initializing environment: %v", err);
            return;
        }

        defer env.ReleaseEnv();

        if err := server.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
            log.Fatalf("HTTP server error: %v", err);
        }
        log.Println("Stopped serving new connections.");
    }()

    shutdownCtx, shutdownRelease := context.WithTimeout(context.Background(), 10 * time.Second);
    defer shutdownRelease();

    var sigChan chan os.Signal = make(chan os.Signal, 1);
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM);
    <-sigChan

    if err := server.Shutdown(shutdownCtx); err != nil {
        log.Fatalf("HTTP shutdown error: %v", err);
    }
    log.Println("Shutdown complete.");
}

