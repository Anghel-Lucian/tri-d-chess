package player

type QueuedPlayer struct {
    PlayerId string;
    Username string;
    TimeQueued uint64;
}

func (player *QueuedPlayer) Equals(compared any) bool {
    if compared == nil {
        return false;
    }

    convertedCompared := compared.(*QueuedPlayer);


    return player.PlayerId == convertedCompared.PlayerId;
}

