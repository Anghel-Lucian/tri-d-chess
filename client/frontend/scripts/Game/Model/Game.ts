import Player from "./Player";
import Move from "./Move";
import Board from "./Board";
import Piece from "./Piece";
import { PieceMap, PieceName, PlayerColor } from "../common";

export default class Game {
    private playerOne: Player;
    private playerTwo: Player;
    private moves: Move[];
    private board: Board;
    private whitePieces: PieceMap; 
    private blackPieces: PieceMap;
    private roundsTillCheckmate: number;
    private kingOnlyRemaining: Player;

    constructor(usernamePlayerOne: string, idPlayerOne: string, usernamePlayerTwo: string, idPlayerTwo: string) {
        this
            .initializePieces()
            .initializePlayers(usernamePlayerOne, idPlayerOne, usernamePlayerTwo, idPlayerTwo)
            .initializeBoard();
    }

    private initializePieces(): Game {
        this.whitePieces[PieceName.King] = new Piece(PieceName.King, PlayerColor.White);
        this.blackPieces[PieceName.King] = new Piece(PieceName.King, PlayerColor.Black);

        this.whitePieces[PieceName.Queen] = new Piece(PieceName.Queen, PlayerColor.White);
        this.blackPieces[PieceName.Queen] = new Piece(PieceName.Queen, PlayerColor.Black);

        for (let i: number = 0; i < 2; i++) {
            this.whitePieces[`${PieceName.Rook}${i}` as keyof PieceMap] = new Piece(PieceName.Rook, PlayerColor.White);
            this.blackPieces[`${PieceName.Rook}${i}` as keyof PieceMap] = new Piece(PieceName.Rook, PlayerColor.Black);

            this.whitePieces[`${PieceName.Knight}${i}` as keyof PieceMap] = new Piece(PieceName.Knight, PlayerColor.White);
            this.blackPieces[`${PieceName.Knight}${i}` as keyof PieceMap] = new Piece(PieceName.Knight, PlayerColor.Black);

            this.whitePieces[`${PieceName.Bishop}${i}` as keyof PieceMap] = new Piece(PieceName.Bishop, PlayerColor.White);
            this.blackPieces[`${PieceName.Bishop}${i}` as keyof PieceMap] = new Piece(PieceName.Bishop, PlayerColor.Black);
        }

        for (let i: number = 0; i < 8; i++) {
            this.whitePieces[`${PieceName.Pawn}${i}` as keyof PieceMap] = new Piece(PieceName.Pawn, PlayerColor.White);
            this.blackPieces[`${PieceName.Pawn}${i}` as keyof PieceMap] = new Piece(PieceName.Pawn, PlayerColor.Black);
        }


        return this;
    }

    private initializePlayers(usernamePlayerOne: string, idPlayerOne: string, usernamePlayerTwo: string, idPlayerTwo: string): Game {
        this.playerOne = new Player(usernamePlayerOne, idPlayerOne, PlayerColor.White, this.whitePieces);
        this.playerTwo = new Player(usernamePlayerTwo, idPlayerTwo, PlayerColor.Black, this.blackPieces);

        return this;
    }

    private initializeBoard(): Game {
        this.board = new Board(this.whitePieces, this.blackPieces);

        return this;
    }
}
