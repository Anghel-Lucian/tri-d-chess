package main

import (
    "os"

    "github.com/joho/godotenv"
)

func loadVariable(key string) string {
    var fileName string;

    if LocalEnv.DevelopmentRun {
        fileName = ".env.dev";
    } else {
        fileName = ".env";
    }

    err := godotenv.Load(fileName);

    if err != nil {
        panic("[Game Server]: Loading .env file failed");
    }

    return os.Getenv(key);
}

