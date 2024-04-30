package db

import (
    "context"
)

type DBClient interface {
    InitDB(ctx context.Context, dbUrl string) error
    Release() error
    PlayerExists(ctx context.Context, playerId string) (playerExists bool, err error)
    SessionExists(ctx context.Context, cookie string) (sessionExists bool, err error)
    CreateActiveGame(ctx context.Context, player1Id string, player2Id string) (gameId string, err error)
}

