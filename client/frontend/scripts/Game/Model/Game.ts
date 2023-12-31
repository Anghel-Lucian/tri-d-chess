import Player from "./Player";
import Move from "./Move";
import Board from "./Board";
import Cell from "./Cell";
import { Piece, PieceMap, PieceName, PlayerColor, MOVES_TILL_STALL } from "../common";
import AttackBoard from "./AttackBoard";
import { SerializedBoards } from "./common";

// TODO: implement checkmate check (whether a player should move the king or another piece)
// TODO: implement turn tracking so that players can't move if its not their turn
    // TODO: implement validators for moves, rotations, attack board moves, forfeits, etc
export default class Game {
    private playerOne: Player;
    private playerTwo: Player;
    private turnOwner: Player;
    private moves: Move[];
    private board: Board;
    private whitePieces: PieceMap; 
    private blackPieces: PieceMap;
    private movesTillStall: number;
    private kingOnlyRemaining: Player;
    private static instance: Game;

    private constructor(usernamePlayerOne: string, idPlayerOne: string, usernamePlayerTwo: string, idPlayerTwo: string) {
        this
            .initializePieces()
            .initializePlayers(usernamePlayerOne, idPlayerOne, usernamePlayerTwo, idPlayerTwo)
            .initializeBoard();
    }

    public static getInstance(usernamePlayerOne: string, idPlayerOne: string, usernamePlayerTwo: string, idPlayerTwo: string): Game {
        if (!this.instance) {
            this.instance = new Game(usernamePlayerOne, idPlayerOne, usernamePlayerTwo, idPlayerTwo);
        }

        return this.instance;
    }

    private initializePieces(): Game {
        this.whitePieces = {};
        this.blackPieces = {};

        this.whitePieces[PieceName.King] = {name: PieceName.King, color: PlayerColor.White, dead: false};
        this.blackPieces[PieceName.King] = {name: PieceName.King, color: PlayerColor.Black, dead: false};

        this.whitePieces[PieceName.Queen] = {name: PieceName.Queen, color: PlayerColor.White, dead: false};
        this.blackPieces[PieceName.Queen] = {name: PieceName.Queen, color: PlayerColor.Black, dead: false};

        for (let i: number = 0; i < 2; i++) {
            this.whitePieces[`${PieceName.Rook}${i}` as keyof PieceMap] = {name: PieceName.Rook, color: PlayerColor.White, dead: false};
            this.blackPieces[`${PieceName.Rook}${i}` as keyof PieceMap] = {name: PieceName.Rook, color: PlayerColor.Black, dead: false};

            this.whitePieces[`${PieceName.Knight}${i}` as keyof PieceMap] = {name: PieceName.Knight, color: PlayerColor.White, dead: false};
            this.blackPieces[`${PieceName.Knight}${i}` as keyof PieceMap] = {name: PieceName.Knight, color: PlayerColor.Black, dead: false};

            this.whitePieces[`${PieceName.Bishop}${i}` as keyof PieceMap] = {name: PieceName.Bishop, color: PlayerColor.White, dead: false};
            this.blackPieces[`${PieceName.Bishop}${i}` as keyof PieceMap] = {name: PieceName.Bishop, color: PlayerColor.Black, dead: false};
        }

        for (let i: number = 0; i < 8; i++) {
            this.whitePieces[`${PieceName.Pawn}${i}` as keyof PieceMap] = {name: PieceName.Pawn, color: PlayerColor.White, dead: false};
            this.blackPieces[`${PieceName.Pawn}${i}` as keyof PieceMap] = {name: PieceName.Pawn, color: PlayerColor.Black, dead: false};
        }


        return this;
    }

    private initializePlayers(usernamePlayerOne: string, idPlayerOne: string, usernamePlayerTwo: string, idPlayerTwo: string): Game {
        this.playerOne = new Player(usernamePlayerOne, idPlayerOne, PlayerColor.White, this.whitePieces);
        this.playerTwo = new Player(usernamePlayerTwo, idPlayerTwo, PlayerColor.Black, this.blackPieces);
        this.turnOwner = this.playerOne;

        return this;
    }

    private initializeBoard(): Game {
        this.board = new Board(this.whitePieces, this.blackPieces);

        return this;
    }

    private endTurn(): Game {
        if (this.turnOwner === this.playerOne) {
            this.turnOwner = this.playerTwo;
        } else if (this.turnOwner === this.playerTwo) {
            this.turnOwner = this.playerTwo;
        }

        return this;
    }

    public getTurnOwner(): Player {
        return this.turnOwner;
    }

    public makeMove(move: Move): Game {
        // TODO: check if move is valid, maybe here/maybe somewhere else, as in before calling this makeMove func
        // TODO: check if attack board is captured
        this.board.makeMove(move);

        const playerOneKingOnly: boolean = this.playerOne.hasKingOnly();
        const playerTwoKingOnly: boolean = this.playerTwo.hasKingOnly();

        if (!this.kingOnlyRemaining) {
            if (playerOneKingOnly) {
                this.kingOnlyRemaining = this.playerOne;
            } else if (playerTwoKingOnly) {
                this.kingOnlyRemaining = this.playerTwo;
            }

            if (this.kingOnlyRemaining) {
                this.movesTillStall = MOVES_TILL_STALL;
            }
        } else {
            if (playerOneKingOnly && playerTwoKingOnly) {
                this.kingOnlyRemaining = null;
                this.movesTillStall = null;
            } else {
                this.movesTillStall--;
            }
        }

        this.moves.push(move);
        this.endTurn();

        return this;
    }

    public skipTurn(): Game {
        this.moves.push(null);
        this.endTurn();

        return this;
    }

    // TODO: will this method get the attack board itself as an argument???
    public rotateAttackBoard(attackBoard: AttackBoard): Game {
        this.board.rotateAttackBoard(attackBoard);

        return this;
    }

    // TODO: implement this, its valid only when there's a single piece on the attack board
    // TODO: will this method get the attack board itself as an argument???
    // TODO: do we need the player as well? does moving the attack board count as a move?
    public moveAttackBoard(attackBoard: AttackBoard, destination: Cell): Game {
        this.board.moveAttackBoard(attackBoard, destination); 

        return this;
    }

    // TODO: methods for getting individual parts and the entire data

    public getSerializedBoards(): SerializedBoards {
        return this.board.getSerialized();
    }

    public getPlayers() {
        return {
            playerOne: this.playerOne,
            playerTwo: this.playerTwo
        }
    }

    public getWhitePieces(): PieceMap {
        return this.whitePieces;
    }

    public getBlackPieces(): PieceMap {
        return this.blackPieces;
    }
}
