package main

import (
    "os"

    "github.com/joho/godotenv"
)

func loadVariable(key string) string {
    err := godotenv.Load(".env");

    if err != nil {
        panic("[Game Server]: Loading .env file failed");
    }

    return os.Getenv(key);
}

