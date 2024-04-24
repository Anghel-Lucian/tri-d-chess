package queue

import (
    "sync"
)

type Queue struct {
    Name string;
    items *List;
    mu sync.Mutex;
}

func NewQueue(name string) *Queue {
    return &Queue{
        Name: name,
        items: &List{
            next: nil,
            prev: nil,
            Val: nil,
        },
    }
}

func (q *Queue) Enqueue(val ListVal) {
    q.mu.Lock();
    q.items.Insert(val);
    q.mu.Unlock();
}

func (q *Queue) Dequeue() ListVal {
    q.mu.Lock();
    defer q.mu.Unlock();

    // The empty head of the list is added to the length, being essentially a nil node.
    // Thus, we need to check if the length is equal to 1, not 0 
    if q.items.Len() == 1 {
        return nil;
    }

    return q.items.Remove(q.items.next).Val; 
}

// Removes an element from between the head and tail.
// If val is not found, the function returns nil. else
// it returns the removed value.
func (q *Queue) RemoveWithin(val ListVal) ListVal {
    q.mu.Lock();
    defer q.mu.Unlock();

    node := q.items.Find(val);

    if node == nil {
        return nil;
    }

    q.items.Remove(node);

    return node.Val;
}

func (q *Queue) Len() int {
    return q.items.Len();
}

// Will iterate over the elements next of the head of the list
func (q *Queue) Iterate(handler func(node *List)) {
    if q.items.Len() > 1 {
        q.items.next.Iterate(handler);
    }
}

