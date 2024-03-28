package models

import (
	"context"
	"log"

	_ "github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
)

type DB struct {
    ConnectionPool *pgxpool.Pool; 
};

func (db *DB) InitDB(dbUrl string) {
    dbPool, err := pgxpool.Connect(context.TODO(), dbUrl);

    if err != nil {
        log.Fatalf("Couldn't connect to DB: %v\n", err);
    }

    dbPingError := dbPool.Ping(context.TODO());

    if dbPingError != nil {
        log.Fatalf("Could not connect to DB: %v", dbPingError);
    } else {
        log.Printf("Connected to DB");
    }

    db.ConnectionPool = dbPool;
}

func (db *DB) GameExists(id string) bool {
    var gameExists bool;
    var typeAssertionOk bool;

    rows, err := db.ConnectionPool.Query(
        context.Background(),
        "SELECT EXISTS (SELECT * FROM active_game WHERE uid = $1)",
        id,
    );

    if err != nil {
        log.Printf("[GameExists] Error while executing query: %v", err);
    }

    for rows.Next() {
        values, err := rows.Values();

        if err != nil {
            log.Printf("[GameExists] Error while reading rows: %v", err);
        }

        gameExists, typeAssertionOk = values[0].(bool);
    }

    if !typeAssertionOk {
        log.Printf("[GameExists] Type assertion error: values[0] does not hold a bool"); 
        return false;
    } else {
        return gameExists;
    }
}



