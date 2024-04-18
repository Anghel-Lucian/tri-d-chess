package utils

import (
	"crypto/rand"
	"encoding/base64"
	"log"
)

func GenRandomString(length int) (string, error) {
    buffer := make([]byte, length);

    _, err := rand.Read(buffer);

    if err != nil {
        log.Printf("[GenRandomString] Error when reading buffer: %v", err);
        return "", err;
    }

    return base64.URLEncoding.EncodeToString(buffer)[:length], nil;
}

