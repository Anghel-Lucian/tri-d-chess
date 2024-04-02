# Tri-D-Chess

Short for tridimensional chess. Defeat your enemies on a galactic scale, by playing... chess?

## Overall architecture
The idea behind this project is a service-based online game able to support a large scale of concurrent two-player matches. There are three main components to the architecture:
1. Game service - handles dissipating events that happen in a match to the correct players (i.e., if one player makes a move, that event should be reflected in the UI on the other player's screen);
2. API server - general API requests that don't fit the other two services (authentication, player statistics, etc.);
3. Player Queue - service responsible for finding two players and matching them together;
4. UI - 3D rendering of the chess board, pieces and other elements.

The interaction between all of these looks something like so:
![Overall system design](https://github.com/Anghel-Lucian/tri-d-chess/blob/master/docs/overall-system-design.png)

*Note: the text and arrows in the figures is black, so you might not see them if you have dark theme set*

## Data layer
The DB at the moment is PostgreSQL. The data is fully structured so there's no need for using something like MongoDB.

There are 6 relations for this system:
1. `active_game` - keeping track of any matches that are taking place in the present;
2. `users` - authenticated users, full with email, password, and username;
3. `game` - a finished match that is not taking place in the present, where one of the players either won, lost or forfeited;
4. `stats` - one-to-one relation with `users`, keeps track of general statistics of a player;
5. `guest` - user that is not authenticated, without email. His username will be automatically assigned, and the entry will be deleted after some time from the DB;
6. `stats_game` - only purpose is to keep track of the statistics entity to which a game is attached.

The diagram looks like so:

![DB diagram depicting associations between each table](https://github.com/Anghel-Lucian/tri-d-chess/blob/master/docs/db-design.png)

## Game service
This component facilitates the interaction in a match between two players. I.e., when player 1 makes a move, player 2's client will reflect that move.

The flow looks like so:
![Game server flow](https://github.com/Anghel-Lucian/tri-d-chess/blob/master/docs/game-service-db-design.png)

1. Two clients register themselves on the Player Queue;
2. Player Queue creates an active game in the single DB;
3. Player Queue sends a request to Game server to signal that a game has started;
4. The UI then sends a subscription request to the game server for each client. The two connections will then be used to push the events from the service to the UI.
5. When a client makes a move, a serialized version of that move is sent to the game server and subsequently stored in the DB;
6. The move is published to the other player via the connection initiated by the UI on step 4.

When it comes to facilitating the interaction between two players, SSEs are used. The vital thing here is that the rows of the DB should be locked such that we prevent a race condition where the current turn is in an erroneous state.

![Game Server SSE interaction between two players](https://github.com/Anghel-Lucian/tri-d-chess/blob/master/docs/game-server-sse-interaction.png)

### Why SSEs instead of Websockets
1. the UI is request-based. One move is an HTTP request, forfeiting is an HTTP request. Additionally, the requests are sparse. One player might take 65 seconds to make a move, another might take 110 seconds. 
In that sense, there is no guarantee of an event happening at a certain interval of time. So, creating a connection right when a request is fired from the UI might be more efficient than keeping a Websocket connection
continuously alive.
2. the payloads are UTF-8 (JSON). In the case they might've been binary, then Websockets could be a proper solution.
3. using SSEs on the server and the UI is very simple;
4. SSEs feature automatic reconnection, so there's no need for the server to handle that case.

There is indeed a maximum connection limit that the system incurs with SSEs, but that will only happen when the same client opens multiple matches, which is unlikely and a case that does not need specific treatment.

### OpenAPI spec
[Here](https://github.com/Anghel-Lucian/tri-d-chess/blob/master/game-server/docs/openapi.yml)

## API Server
### OpenAPI spec
[Here](https://github.com/Anghel-Lucian/tri-d-chess/blob/master/api-server/docs/openapi.yml)
