package models

// TODO: this time we'll try something different when it comes to the interaction
// with the DB. There will be a DB package somewhere for interaction with DB.
// But, these model structs will have methods that they themselves willl interact
// with the client. These methods on the struct will be called by the handlers.
// So you have business logic -> models -> persistence layer.
type FinishedActiveGame struct {
    Winner string `json:"winner"`
    Loser string `json:"loser"`
    GameId string `json:"gameId"`
    Forfeited bool `json:"forfeited"`
}

