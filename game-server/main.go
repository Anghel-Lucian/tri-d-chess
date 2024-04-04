package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
    "time"

    "github.com/google/uuid"

    "game-server/models"
)

type Env struct {
    DevelopmentRun bool;
    Db models.DBClient;
}

var LocalEnv Env = Env{};

// TODO: server sends updates even after the client is down, didn't test for more than 10 seconds to see what happens
// TODO: when receiving a request, how to identify what client to send an update to?
// TODO: connect to DB logic
// TODO: query DB logic
func main() {
    flag.BoolVar(&LocalEnv.DevelopmentRun, "dev", false, "Start the server in development mode");

    flag.Parse();

    serverPort := loadVariable("GAME_SERVER_PORT");

    server := &http.Server{
        Addr: serverPort,
    };

    http.HandleFunc("/register-game", getHello);
    http.HandleFunc("/game-subscribe", gameSubscribe);

    go func() {
        dbCtx, cancelDbCtx := context.WithCancel(context.Background());
        defer cancelDbCtx();

        LocalEnv.Db = &models.DB{};
        // TODO: connect to DB initial error handling and retries
        LocalEnv.Db.InitDB(dbCtx, loadVariable("DATABASE_URL"));

        defer LocalEnv.Db.Release();
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

// TODO: you should always return JSON, regardless of request
func getHello(w http.ResponseWriter, r *http.Request) {
    fmt.Printf("Get hello called");

    requestCtx, cancelRequestCtx := context.WithTimeout(context.Background(), 5 * time.Second);
    defer cancelRequestCtx();

    gameExists, err := LocalEnv.Db.GameExists(requestCtx, uuid.New().String());

    fmt.Printf("Game exists: %v\n", gameExists);

    if err != nil {
        log.Printf("[register-game] Error while querying DB for checking existance of game\n");
    }

    io.WriteString(w, "Hello from game-server\n");
}


