import { AttackBoardType, FullBoardType } from "../common";
import AttackBoard from "./AttackBoard";
import { Piece } from "../common";

export default class Cell {
    public x: number;
    public y: number;
    public board: AttackBoardType | FullBoardType;
    public piece: Piece;
    public hostedAttackBoard: AttackBoard;

    constructor(x: number, y: number, type: AttackBoardType | FullBoardType, piece?: Piece, hostedAttackBoard?: AttackBoard) {
        this.x = x;
        this.y = y;
        this.board = type;

        if (piece) {
            this.piece = piece;
        }

        if (hostedAttackBoard) {
            this.hostedAttackBoard = hostedAttackBoard;
        }
    }
}
