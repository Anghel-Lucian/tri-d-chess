package main

import (
	"log"
	"sync"
    "errors"

	"player-queue/internal/queue"
    "player-queue/internal/player"
)

var qpLock = sync.Mutex{};

type PlayerQueuePool struct {
    Queues map[string]*queue.Queue;
    mu sync.Mutex;
}

var QP *PlayerQueuePool;

func GetPlayerQueuePoolInstance() *PlayerQueuePool {
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

func (qp *PlayerQueuePool) CreateNewQueue(name string) error {
    qp.mu.Lock();
    defer qp.mu.Unlock();

    _, ok := qp.Queues[name];

    if ok {
        message := "[QueuePool] Trying to create queue with duplicate names is not allowed: " + name; 
        log.Printf(message);
        return errors.New(message);
    }

   qp.Queues[name] = queue.NewQueue(name);

   return nil;
}

// TODO: need to ensure that a player can't be queued in two queues at the same time
func (qp *PlayerQueuePool) Enqueue(queueName string, player *player.QueuedPlayer) error {
    qp.mu.Lock();
    defer qp.mu.Unlock();

    queue, ok := qp.Queues[queueName];

    if !ok {
        message := "[QueuePool] Queue does not exist: " + queueName; 
        log.Printf(message);
        return errors.New(message);
    }

    queue.Enqueue(player);

    return nil;
}

// TODO: 
// btw, you can't use the qp.mu here, because Match would run inside Enqueue,
// which already has qp.mu.Lock() isnide of it
func (qp *PlayerQueuePool) Match(queueName string, player1 *player.QueuedPlayer, player2 *player.QueuedPlayer) error {
      

    return nil;
}

// TODO: deletion
// TODO: matching of two
// TODO: deletion of queues

