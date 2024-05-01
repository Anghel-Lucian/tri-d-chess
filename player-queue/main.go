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

	"github.com/joho/godotenv"

	"player-queue/internal/env"
	"player-queue/internal/handlers"
	"player-queue/internal/playerqueuepool"
)

// TODO: server sends updates even after the client is down, didn't test for more than 10 seconds to see what happens
func main() {
    var devRun bool;

    flag.BoolVar(&devRun, "dev", false, "Start the server in development mode");

    flag.Parse();

    var fileName string;

    if devRun {
        fileName = ".env.dev";
    } else {
        fileName = ".env";
    }

    err := godotenv.Load(fileName);

    if err != nil {
        log.Fatalf("[Game Server]: Loading .env file failed");
        return;
    }

    serverPort := os.Getenv("PLAYER_QUEUE_PORT");

    server := &http.Server{
        Addr: serverPort,
    };

    http.HandleFunc("/enqueue", handlers.AuthCheckDecorator(handlers.Enqueue));

    go func() {
        err := env.InitEnv();
        playerqueuepool.SyncGetPlayerQueuePoolInstance(context.Background());

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

    shutdownCtx, shutdownRelease := context.WithCancel(context.Background());
    defer shutdownRelease();

    var sigChan chan os.Signal = make(chan os.Signal, 1);
    signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM);
    <-sigChan

    if err := server.Shutdown(shutdownCtx); err != nil {
        log.Fatalf("HTTP shutdown error: %v", err);
    }
    log.Println("Shutdown complete.");
}
