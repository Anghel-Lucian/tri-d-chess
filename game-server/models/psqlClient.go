package models

import (
	"context"
	"log"

	//"github.com/jackc/pgx/v4"
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
    // TODO: check for error handling
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
        return false, nil;
    } else {
        return gameExists, nil;
    }
}

// TODO: this
// TODO: the connection can be closed only after the rows returned by QueryRow are scanned;
// i.e., Rows.Scan() is called on them
func (db *DB) SwitchTurn(ctx context.Context, gameId string) error {
    //tx, err := db.ConnectionPool.BeginTx(ctx, pgx.TxOptions{});

    //if err != nil {
        log.Printf("[Turn] Error while acquiring transaction\n");
     //   return err;
   // }

    //tx.QueryRow()

    return nil; 
}


