package player

import "net/http"

type QueuedPlayer struct {
    PlayerId string;
    //Username string; TODO: still deciding if we need this. The QueuedPlayer will
    // be initialized only in the queue pool
    QueuedTimestamp int64;
    QueuedOn string;

    Matched chan struct{};
    Writer *http.ResponseWriter;
}

func (player *QueuedPlayer) Equals(compared any) bool {
    if compared == nil {
        return false;
    }

    convertedCompared := compared.(*QueuedPlayer);


    return player.PlayerId == convertedCompared.PlayerId;
}

