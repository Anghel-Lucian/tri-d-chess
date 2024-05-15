package playerqueuepool

import (
	"context"
	"errors"
	"log"
	"os"
	"strconv"
	"sync"
	"time"

	"player-queue/internal/models"
	"player-queue/internal/player"
	"player-queue/internal/queue"
)

var qpLock = sync.Mutex{};

type PlayerQueuePool struct {
    mu sync.Mutex;
    Queues map[string]*queue.Queue;
}

var qpInstance *PlayerQueuePool;

// Will return the Singleton instance of the PlayerQueuePool and also start
// an eviction routine to run once every env.PLAYER_EVICTION_LIMIT seconds
func SyncGetPlayerQueuePoolInstance(ctx context.Context) *PlayerQueuePool {
    if qpInstance == nil {
        qpLock.Lock();
        defer qpLock.Unlock();

        queueMap := map[string]*queue.Queue{
            "Public": queue.NewQueue("Public"),
        }

        qpInstance = &PlayerQueuePool{
            Queues: queueMap,
        };

        go func() {
            evictionLimit, err := strconv.Atoi(os.Getenv("PLAYER_EVICTION_LIMIT"));

            if err != nil {
                log.Printf("[QueuePool:SyncGetPlayerQueuePoolInstance:Goroutine] Error converting PLAYER_EVICTION_LIMIT to integer: %v", err);
                return;
            }

            ticker := time.NewTicker(time.Duration(evictionLimit))

            for {
                select {
                case <-ticker.C:
                    qpInstance.SyncPollEvict();
                case <-ctx.Done():
                    ticker.Stop();
                    return;
                }
            }
        }()
    }

    return qpInstance;
}

func (qp *PlayerQueuePool) SyncCreateNewQueue(name string) error {
    qp.mu.Lock();
    defer qp.mu.Unlock();

    _, ok := qp.Queues[name];

    if ok {
        message := "[QueuePool:SyncCreateNewQueue] Trying to create queue with duplicate names is not allowed: " + name; 
        log.Printf(message);
        return errors.New(message);
    }

   qp.Queues[name] = queue.NewQueue(name);

   return nil;
}

// TODO: need to ensure that a player can't be queued in two queues at the same time

// If this function returns two players it means that they were matched for a game.
// If the queue they were matched in was not "Public", then it is deleted.
func (qp *PlayerQueuePool) SyncEnqueue(
    ctx context.Context, 
    queueName string, 
    enqueuedPlayer *player.QueuedPlayer,
) error {
    qp.mu.Lock();
    defer qp.mu.Unlock();

    q, ok := qp.Queues[queueName];

    if !ok {
        q = queue.NewQueue(queueName)
        qp.Queues[queueName] = q;
    }

    // queue.Len() adds the head to the count as well, which is a nil node
    if q.Len() > 1 {
        player2 := q.Dequeue().(*player.QueuedPlayer);

        activeGame := &models.ActiveGame{
            Player1: enqueuedPlayer.PlayerId,
            Player2: player2.PlayerId,
        };

        _, err := activeGame.Store(ctx);

        if err != nil {
            log.Printf("[QueuePool:SyncEnqueue] Could not create active game: %v\n", err);
            return err;
        }

        player2.Matched <- activeGame.Id;
        enqueuedPlayer.Matched <- activeGame.Id;

        return nil; 
    }

    q.Enqueue(enqueuedPlayer);

    return nil;
}

func (qp *PlayerQueuePool) DeleteQueue(ctx context.Context, queueName string) error {
    _, ok := qp.Queues[queueName];

    if !ok {
        message := "[QueuePool:DeleteQueue] Queue does not exist: " + queueName; 
        log.Printf(message);
        return errors.New(message);
    }

    delete(qp.Queues, queueName);

    return nil;
}

func (qp *PlayerQueuePool) SyncDeleteQueue(ctx context.Context, queueName string) error {
    qp.mu.Lock();
    defer qp.mu.Unlock();

    return qp.DeleteQueue(ctx, queueName);
}

func (qp *PlayerQueuePool) SyncDeletePlayerFromQueue(
    ctx context.Context, 
    queueName string, 
    enqueuedPlayer *player.QueuedPlayer,
) error {
    qp.mu.Lock();
    defer qp.mu.Unlock();

    queue, ok := qp.Queues[queueName];

    if !ok {
        message := "[QueuePool:SyncDeletePlayerFromQueued] Queue does not exist: " + queueName; 
        log.Printf(message);
        return errors.New(message);
    }

    queue.RemoveWithin(enqueuedPlayer);

    return nil;
}

// Iterate over existing queues and queued players.
// If the queues are empty and they aren't the Public queue, remove them.
// If the players enqueued in a queue have been there for more than 10 minutes,
// evict them.
// The degree of accuracy of eviction-on-time varies depending on the polling interval.
// This function doesn't guarantee that a player will not spend more than 10 minutes on
// a queues.
func (qp *PlayerQueuePool) SyncPollEvict() {
    var queuesScheduledForDeletion []string;
    var playersScheduledForEviction []*player.QueuedPlayer;

    evictionLimit, err := strconv.Atoi(os.Getenv("PLAYER_EVICTION_LIMIT"));

    if err != nil {
        log.Printf("[QueuePool:SyncPollEvict] Error converting PLAYER_EVICTION_LIMIT to integer: %v", err);
        return;
    }

    // Unix timestamp before which if a player was queued,
    // he'll be evicted
    timeLimit := time.Now().Unix() - int64(evictionLimit);

    for qName, q := range qp.Queues {
        // find queues with no players
        if q.Len() == 0 && qName != "Public" {
            queuesScheduledForDeletion = append(queuesScheduledForDeletion, qName); 
            continue;
        } else if q.Len() > 1 {
            // find players who were enqueued for more than 10 minutes 
            q.Iterate(func(node *queue.List) {
                enqueuedPlayer := node.Val.(*player.QueuedPlayer);

                // if the player was queued BEFORE the time limit
                if enqueuedPlayer.QueuedTimestamp < timeLimit {
                    playersScheduledForEviction = append(playersScheduledForEviction, enqueuedPlayer);
                }
            });
        }
    }

    // The actual deletion requires locking for it to not risk breaking anything.
    // Reading could also be synchronized to ensure that we're not deleting unexistent
    // entries, but no errors will be thrown if that happens, so we'll keep our 
    // critical section small.
    qp.mu.Lock();
    defer qp.mu.Unlock();

    for _, qName := range queuesScheduledForDeletion {
        delete(qp.Queues, qName);
    }

    for _, enqueuedPlayer := range playersScheduledForEviction {
        qp.Queues[enqueuedPlayer.QueuedOn].RemoveWithin(enqueuedPlayer);
    }
}

