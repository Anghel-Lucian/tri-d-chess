package env

import (
    "os"
    "log"

    "github.com/joho/godotenv"
)

func LoadVariable(key string) string {
    var fileName string;

    if LocalEnv.DevelopmentRun {
        fileName = ".env.dev";
    } else {
        fileName = ".env";
    }

    err := godotenv.Load(fileName);

    if err != nil {
        log.Fatalf("[Game Server]: Loading .env file failed");
    }

    return os.Getenv(key);
}
