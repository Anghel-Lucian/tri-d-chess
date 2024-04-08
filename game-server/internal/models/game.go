package models

type FinishedActiveGame struct {
    Winner string `json:"winner"`
    Loser string `json:"loser"`
    GameId string `json:"gameId"`
    Forfeited bool `json:"forfeted"`
}

