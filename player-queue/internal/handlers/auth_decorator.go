package handlers

import (
	"context"
	"log"
	"net/http"

    "player-queue/internal/env"
)

// Decorates a handler such that it checks if the request has a valid
// cookie attached to it
func AuthCheckDecorator(h http.HandlerFunc) http.HandlerFunc {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        cookieName := env.LoadVariable("SESSION_COOKIE_LABEL");

        cookie, err := r.Cookie(cookieName);

        if err != nil {
            log.Printf("[AuthCheckDecorator] No cookie found. Not authorized: %v", err);
            BadRequest(&w, r, "Unauthorized actor", http.StatusUnauthorized);
            return;
        }

        sessionExists, err := env.LocalEnv.DB.SessionExists(context.TODO(), cookie.Value); 

        if err != nil {
            log.Printf("[AuthCheckDecorator] Error when checking if sessions exists: %v", err);
            BadRequest(&w, r, "Error when checking for session existence", http.StatusInternalServerError);
            return;
        }

        if !sessionExists {
            log.Printf("[AuthCheckDecorator] Session does not exist. Forbidden");
            BadRequest(&w, r, "Forbidden", http.StatusForbidden);
            return;
        }

        h(w, r);
    });
}

