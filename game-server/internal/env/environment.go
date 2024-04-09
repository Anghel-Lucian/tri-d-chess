package env

import (
    "context"

    "game-server/internal/models"
)

type Env struct {
    DevelopmentRun bool;
    DB models.DBClient;
    CancelDBCtx func();
}

var LocalEnv Env = Env{};

func InitEnv() error {
    dbCtx, cancelDbCtx := context.WithCancel(context.Background());
    LocalEnv.CancelDBCtx = cancelDbCtx;
    LocalEnv.DB = &models.DB{};
    // TODO: connect to DB initial error handling and retries
    return LocalEnv.DB.InitDB(dbCtx, LoadVariable("DATABASE_URL"));
}

func ReleaseEnv() {
    LocalEnv.CancelDBCtx();
    LocalEnv.DB.Release();
}

