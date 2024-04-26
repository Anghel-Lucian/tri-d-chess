package handlers

import (
	"context"
	"log"
	"net/http"
	"time"

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

        ctx, cancelCtx := context.WithTimeout(context.Background(), time.Second * 1);
        defer cancelCtx();

        sessionExistsCh, errCh := make(chan bool), make(chan error);
   

        go func() {
            sessionExists, err := env.LocalEnv.DB.SessionExists(ctx, cookie.Value); 

            if err != nil {
                errCh <- err;
            } else {
                sessionExistsCh <- sessionExists;
            }
        }();

        select {
        case sessionExists := <-sessionExistsCh:
            if sessionExists {
                h(w, r);
            } else {
                log.Printf("[AuthCheckDecorator] Session does not exist. Forbidden");
                BadRequest(&w, r, "Forbidden", http.StatusForbidden);
                return;
            }
        case err := <-errCh:
            log.Printf("[AuthCheckDecorator] Error when checking if sessions exists: %v", err);
            BadRequest(&w, r, "Error when checking for session existence", http.StatusInternalServerError);
            return;
        case <-ctx.Done():
            log.Printf("[AuthCheckDecorator] Session check timeout. Context error: %v", ctx.Err());
            BadRequest(&w, r, "Session check timeout", http.StatusRequestTimeout);
            return;
        }
    });
}

