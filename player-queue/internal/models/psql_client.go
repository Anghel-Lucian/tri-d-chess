package models

import (
	"context"
	"log"
    "errors"

	"github.com/jackc/pgx/v4"
	_ "github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
)


// TODO: see https://stackoverflow.com/questions/69404758/transaction-in-golang-with-pgx
// for an interesting idea of scanning a row per model. In our case, the model would be
// ActiveGame or Game (whatever you want to call it) and it would have a ScanRow function
// for after being created, it will assign its own fields depending on what it scanned
type DB struct {
    ConnectionPool *pgxpool.Pool; 
};

func (db *DB) InitDB(ctx context.Context, dbUrl string) error {
    dbPool, err := pgxpool.Connect(ctx, dbUrl);

    if err != nil {
        log.Fatalf("Couldn't connect to DB: %v\n", err);
        return err;
    }

    dbPingError := dbPool.Ping(ctx);

    if dbPingError != nil {
        log.Fatalf("Could not connect to DB: %v", dbPingError);
    } else {
        log.Printf("Connected to DB");
    }

    db.ConnectionPool = dbPool;
    return nil;
}

func (db *DB) Release() error {
    log.Printf("Releasing DB connections.");
    db.ConnectionPool.Close();
    return nil;
}

func (db *DB) GameExists(ctx context.Context, gameId string) (gameExists bool, err error) {
    var typeAssertionOk bool;

    rows, err := db.ConnectionPool.Query(
        ctx,
        "SELECT EXISTS (SELECT * FROM active_game WHERE uid = $1)",
        gameId,
    );

    if err != nil {
        log.Printf("[GameExists] Error while executing query: %v", err);
        return false, err;
    }

    for rows.Next() {
        values, err := rows.Values();

        if err != nil {
            log.Printf("[GameExists] Error while reading rows: %v", err);
            return false, err;
        }

        gameExists, typeAssertionOk = values[0].(bool);
    }

    if !typeAssertionOk {
        log.Printf("[GameExists] Type assertion error: values[0] does not hold a bool"); 
        return false, errors.New("[GameExists] error when asserting bool type");
    } else {
        return gameExists, nil;
    }
}

func (db *DB) PlayerExists(ctx context.Context, playerId string) (playerExists bool, err error) {
    var typeAssertionOk bool;

    rows, err := db.ConnectionPool.Query(
        ctx,
        "SELECT EXISTS (SELECT * FROM users WHERE uid = $1)",
        playerId,
    );

    if err != nil {
        log.Printf("[PlayerExists] Error while executing query: %v", err);
        return false, err;
    }

    for rows.Next() {
        values, err := rows.Values();

        if err != nil {
            log.Printf("[PlayerExists] Error while reading rows: %v", err);
            return false, err;
        }

        playerExists, typeAssertionOk = values[0].(bool);
    }

    if !typeAssertionOk {
        log.Printf("[PlayerExists] Type assertion error: values[0] does not hold a bool"); 
        return false, errors.New("[PlayerExists] error when asserting bool type");
    } else {
        return playerExists, nil;
    }
}

func (db *DB) SessionExists(ctx context.Context, cookie string) (sessionExists bool, err error) {
    var typeAssertionOk bool;

    rows, err := db.ConnectionPool.Query(
        ctx,
        "SELECT EXISTS (SELECT * FROM sessions WHERE cookie = $1)",
        cookie,
    );

    if err != nil {
        log.Printf("[SessionExists] Error while executing query: %v", err);
        return false, err;
    }

    for rows.Next() {
        values, err := rows.Values();

        if err != nil {
            log.Printf("[SessionExists] Error while reading rows: %v", err);
            return false, err;
        }

        sessionExists, typeAssertionOk = values[0].(bool);
    }

    if !typeAssertionOk {
        log.Printf("[SessionExists] Type assertion error: values[0] does not hold a bool"); 
        return false, errors.New("[SessionExists] error when asserting bool type");
    } else {
        return sessionExists, nil;
    }
}

func (db *DB) CreateActiveGame(ctx context.Context, player1Id string, player2Id string) error {
    commandTag, err := db.ConnectionPool.Exec(
        ctx,
        "INSERT INTO active_game (player1, player2) VALUES ($1, $2)",
        player1Id,
        player2Id,
    );

    if err != nil {
        log.Printf("[CreateActivGame] Error executing insert: %v", err);
        return err;
    }

    if commandTag.RowsAffected() != 1 {
        err := errors.New("No rows were affected by INSERT call. Bad INSERT");
        log.Printf("[CreateActiveGame] Bad result after executing query: %v", err);
        return err;
    }

    return nil;
}

