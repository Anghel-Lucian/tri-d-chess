package queue

type ListVal interface {
    Equals(val any) bool;
}

type List struct {
    next *List;
    prev *List;
    Val ListVal;
}

func (l *List) Insert(val ListVal) *List {
    lPointer := l;

    for lPointer.next != nil {
        lPointer = lPointer.next; 
    }
   
    node := &List{
        next: nil,
        prev: lPointer,
        Val: val,
    };

    lPointer.next = node;

    return node;
}

func (l *List) Remove(node *List) *List {
    if node == nil {
        return nil;
    }

    if node.prev != nil {
        node.prev.next = node.next;
    }

    if node.next != nil {
        node.next.prev = node.prev;
    }

    return node;
}

func (l *List) Find(val ListVal) *List {
    lPointer := l;

    for lPointer != nil {
        lPointer = lPointer.next;

        if val.Equals(lPointer.Val) {
            return lPointer;
        }
    }

    return nil;
}

func (l *List) Len() int {
    lPointer := l;
    length := 0;

    for lPointer != nil {
        length++;
        lPointer = lPointer.next;
    }

    return length;
}

func (l *List) Iterate(handler func(node *List)) {
    lPointer := l;

    for lPointer != nil {
        lPointer = lPointer.next;

        handler(lPointer);
    }
}

