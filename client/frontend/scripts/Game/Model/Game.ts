import Player from "./Player";
import Move from "./Move";
import Board from "./Board";
import Piece from "./Piece";

export default class Game {
    private playerOne: Player;
    private playerTwo: Player;
    private moves: Move[];
    private board: Board;
    private pieces: Piece[];
    private roundsTillCheckmate: number;
    private kingOnlyRemaining: Player;

    constructor(playerOne: Player, playerTwo: Player) {
        this.playerOne = playerOne;
        this.playerTwo = playerTwo;
    }
}
