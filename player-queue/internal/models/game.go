package models

import (
	"context"
	"player-queue/internal/env"
)

type ActiveGame struct {
    Id string;
    Player1 string
    Player2 string
}

func (g *ActiveGame) Store(ctx context.Context) (*ActiveGame, error) {
    gameId, err := env.LocalEnv.DB.CreateActiveGame(ctx, g.Player1, g.Player2);

    if err != nil {
        return nil, err;
    }

    g.Id = gameId;

    return g, nil;
}

