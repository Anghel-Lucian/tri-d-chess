package env

import (
    "context"
    "os"

    "player-queue/internal/db"
)

type Env struct {
    DevelopmentRun bool;
    DB db.DBClient;
    CancelCtx func();
}

var LocalEnv Env = Env{};

func InitEnv() error {
    envCtx, cancelEnvCtx := context.WithCancel(context.Background());

    LocalEnv.CancelCtx = cancelEnvCtx;
    LocalEnv.DB = &db.DB{};
    LocalEnv.DB.InitDB(envCtx, os.Getenv("DATABASE_URL"));

    return nil;
}

func ReleaseEnv() {
    LocalEnv.CancelCtx();
    LocalEnv.DB.Release();
}

