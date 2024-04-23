package main

import (
	"context"
	"errors"
	"log"
	"sync"

	"player-queue/internal/player"
	"player-queue/internal/queue"
)

var qpLock = sync.Mutex{};

type PlayerQueuePool struct {
    Queues map[string]*queue.Queue;
    mu sync.Mutex;
}

var QP *PlayerQueuePool;

func SyncGetPlayerQueuePoolInstance() *PlayerQueuePool {
    if QP == nil {
        qpLock.Lock();
        defer qpLock.Unlock();

        queueMap := map[string]*queue.Queue{
            "Public": queue.NewQueue("Public"),
        }

        QP = &PlayerQueuePool{
            Queues: queueMap,
        };
    }

    return QP;
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
// TODO: need a polling function that will run on each queue and check if they have been
// queued for a particularly long time, if yes, then evict them. I don't think you NEED it
// but it would be interesting to implement. Also, not only players, but private queues as well

// If this function returns two players it means that they were matched for a game.
// If the queue they were matched in was not "Public", then it is deleted.
func (qp *PlayerQueuePool) SyncEnqueue(
    ctx context.Context, 
    queueName string, 
    enqueuedPlayer *player.QueuedPlayer, // TODO: the caller of this function will have to call
    // the API  to get the details (username most importantly)
) (*player.QueuedPlayer, *player.QueuedPlayer, error) {
    qp.mu.Lock();
    defer qp.mu.Unlock();

    queue, ok := qp.Queues[queueName];

    if !ok {
        message := "[QueuePool:SyncEnqueue] Queue does not exist: " + queueName; 
        log.Printf(message);
        return nil, nil, errors.New(message);
    }

    if queue.Len() > 0 {
        player2 := queue.Dequeue().(*player.QueuedPlayer);

        if queueName != "Public" {
            qp.DeleteQueue(ctx, queueName);
        }

        return enqueuedPlayer, player2, nil; 
    }

    queue.Enqueue(enqueuedPlayer);

    return nil, nil, nil;
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

func (qp *PlayerQueuePool) PollEvict(ctx context.Context) {

}

