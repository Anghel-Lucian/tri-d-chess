import Player from "./Player";
import Move from "./Move";
import Board from "./Board";
import Piece from "./Piece";
import { PieceName, PlayerColor } from "../common";

export default class Game {
    private playerOne: Player;
    private playerTwo: Player;
    private moves: Move[];
    private board: Board;
    private whitePieces: Piece[];
    private blackPieces: Piece[];
    private roundsTillCheckmate: number;
    private kingOnlyRemaining: Player;

    constructor(usernamePlayerOne: string, idPlayerOne: string, usernamePlayerTwo: string, idPlayerTwo: string) {
        this
            .initializePieces()
            .initializeBoard();
        //this.playerOne = new Player;
        //this.playerTwo = playerTwo;
    }

    private initializePieces(): Game {
        this.whitePieces.push(new Piece(PieceName.King, PlayerColor.White));
        this.blackPieces.push(new Piece(PieceName.King, PlayerColor.Black));

        this.whitePieces.push(new Piece(PieceName.Queen, PlayerColor.White));
        this.blackPieces.push(new Piece(PieceName.Queen, PlayerColor.Black));

        for (let i: number = 0; i < 2; i++) {
            this.whitePieces.push(new Piece(PieceName.Rook, PlayerColor.White));
            this.blackPieces.push(new Piece(PieceName.Rook, PlayerColor.Black));

            this.whitePieces.push(new Piece(PieceName.Knight, PlayerColor.White));
            this.blackPieces.push(new Piece(PieceName.Knight, PlayerColor.Black));

            this.whitePieces.push(new Piece(PieceName.Bishop, PlayerColor.White));
            this.blackPieces.push(new Piece(PieceName.Bishop, PlayerColor.Black));
        }

        for (let i: number = 0; i < 8; i++) {
            this.whitePieces.push(new Piece(PieceName.Pawn, PlayerColor.White));
            this.blackPieces.push(new Piece(PieceName.Pawn, PlayerColor.Black));
        }


        return this;
    }

    private initializeBoard(): Game {
        this.board = new Board(this.whitePieces, this.blackPieces);

        return this;
    }
}
