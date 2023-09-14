import Cell from "./Cell";
import Piece from "./Piece";

export default class Move {
    public piece: Piece;
    public startCell: Cell;
    public endCell: Cell;
    public eaten: Piece;

    constructor(piece: Piece, startCell: Cell, endCell: Cell, eaten: Piece) {
        this.piece = piece;
        this.startCell = startCell;
        this.endCell = endCell;
        this.eaten = eaten;
    }
}

