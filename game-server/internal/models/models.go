package models

import (
    "context"
)

type DBClient interface {
    InitDB(ctx context.Context, dbUrl string) error
    Release() error
    GameExists(ctx context.Context, gameId string) (gameExists bool, err error)
    SwitchTurn(ctx context.Context, gameId string) error
    FinishGame(ctx context.Context, game FinishedActiveGame) error
}

