package handlers

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

    "game-server/internal/models"
)

type AckEvent struct {
    Ack bool `json:"ack"`
}

type MoveEvent struct {
    Data *models.Move `json:"data"`
}

func SendAck(w *http.ResponseWriter) error {
    event := AckEvent{
        Ack: true,
    };

    json.NewEncoder(*w).Encode(event);
    log.Printf("[Event] Sending ACK");
    flusher, typeAssertionOk := (*w).(http.Flusher);

    if !typeAssertionOk {
        log.Printf("[Event] Error when asserting http.ResponseWriter to http.Flusher");
        return errors.New("[Event] Error when doing type assertion");
    }

    flusher.Flush();
    return nil;
}

func SendMove(w *http.ResponseWriter, move *models.Move) error {
    event := MoveEvent{
        Data: move,
    };

    json.NewEncoder(*w).Encode(event);
    log.Printf("[Event] Sending move event");

    flusher, typeAssertionOk := (*w).(http.Flusher)


    if !typeAssertionOk {
        log.Printf("[Event] Error when asserting http.ResponseWriter to http.Flusher");
        return errors.New("[Event] Error when doing type assertion");
    }

    flusher.Flush();
    return nil;
}

