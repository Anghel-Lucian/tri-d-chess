package queue

import (
    "testing"
)

type Item struct {
    t string;
    c int;
}

func (i *Item) Equals(iToCompare any) bool {
    if iToCompare == nil {
        return false;
    }

    convertedIToCompare := iToCompare.(*Item);

    return i.t == convertedIToCompare.t && i.c == convertedIToCompare.c;
}

func TestInsert(t *testing.T) {
    head := &List{
        next: nil,
        prev: nil,
        val: nil,
    }

    itemHats := &Item{t: "hats", c: 4};
    itemSocks := &Item{t: "socks", c: 3};
    itemPants := &Item{t: "pants", c: 10};
    itemShirts := &Item{t: "shirts", c: 3};

    node1 := head.Insert(itemHats);
    node2 := head.Insert(itemSocks);
    node3 := head.Insert(itemPants);
    node4 := head.Insert(itemShirts);

    if head.next == nil {
        t.Errorf("head.next: nil; expected: %v", node1);
    }

    if node1.prev != head {
        t.Errorf("node1.prev: %v; expected: %v", node1.prev, head);
    }

    if node4.next != nil {
        t.Errorf("node4.next: %v; expected: nil", node4.next);
    }

    if head.next != node1 {
        t.Errorf("head.next != node1. Insertion should add nodes at the end");
    }

    if node2.prev != node1 {
        t.Errorf("node2.prev != node1. <node>.prev should point to previous node");
    }

    if node3.next != node4 {
        t.Errorf("node3.next: %v; node4: %v; expected: node3.next == node4", node3.next, node4);
    }
}

func TestLen(t *testing.T) {
    head := &List{
        next: nil,
        prev: nil,
        val: nil,
    }

    itemHats := &Item{t: "hats", c: 4};
    itemSocks := &Item{t: "socks", c: 3};
    itemPants := &Item{t: "pants", c: 10};
    itemShirts := &Item{t: "shirts", c: 3};

    head.Insert(itemHats);
    head.Insert(itemSocks);
    head.Insert(itemPants);
    head.Insert(itemShirts);

    if head.Len() != 5 {
        t.Errorf("head.Len(): %d; expected: 5", head.Len());
    }
}

func TestRemove(t *testing.T) {
    head := &List{
        next: nil,
        prev: nil,
        val: nil,
    }

    itemHats := &Item{t: "hats", c: 4};
    itemSocks := &Item{t: "socks", c: 3};
    itemPants := &Item{t: "pants", c: 10};
    itemShirts := &Item{t: "shirts", c: 3};

    head.Insert(itemHats);
    node2 := head.Insert(itemSocks);
    head.Insert(itemPants);
    node4 := head.Insert(itemShirts);
    
    preRemoveLen := head.Len();

    node2Removed := head.Remove(node2);

    if node2Removed != node2 {
        t.Errorf("node2Removed: %v; node2: %v; expected node2Removed == node2", node2Removed, node2);
    }

    postRemoveLen1 := head.Len();

    node4Removed := head.Remove(node4);

    if node4Removed != node4 {
        t.Errorf("node4Removed: %v; node4: %v; expected node4Removed == node4", node4Removed, node4);
    }
    postRemoveLen2 := head.Len();

    if !(preRemoveLen > postRemoveLen1) {
        t.Errorf("preRemoveLen: %d; postRemoveLen1: %d; Expected preRemoveLen == postRemoveLen1 - 1", preRemoveLen, postRemoveLen1);
    }

    if !(postRemoveLen1 > postRemoveLen2) {
        t.Errorf("postRemoveLen1: %d; postRemoveLen2: %d; Expected postRemoveLen1 == postRemoveLen2 - 1", postRemoveLen1, postRemoveLen2);
    }
}

func TestFind(t *testing.T) {
    head := &List{
        next: nil,
        prev: nil,
        val: nil,
    }

    itemHats := &Item{t: "hats", c: 4};
    itemSocks := &Item{t: "socks", c: 3};
    itemPants := &Item{t: "pants", c: 10};
    itemShirts := &Item{t: "shirts", c: 3};

    node1 := head.Insert(itemHats);
    node2 := head.Insert(itemSocks);
    node3 := head.Insert(itemPants);
    node4 := head.Insert(itemShirts);

    node1Found := head.Find(itemHats);
    node2Found := head.Find(itemSocks);
    node3Found := head.Find(itemPants);
    node4Found := head.Find(itemShirts);

    if node1 != node1Found {
        t.Errorf("node1: %v; node1Found: %v; expected node1 == node1Found", node1, node1Found);
    }

    if node2 != node2Found {
        t.Errorf("node2: %v; node2Found: %v; expected node2 == node2Found", node2, node2Found);
    }

    if node3 != node3Found {
        t.Errorf("node3: %v; node3Found: %v; expected node3 == node3Found", node3, node3Found);
    }
    
    if node4 != node4Found {
        t.Errorf("node4: %v; node4Found: %v; expected node4 == node4Found", node4, node4Found);
    }
}

