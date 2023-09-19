import Cell from "./Cell";
import Piece from "./Piece";

export default class Move {
    public piece: Piece;
    public startCell: Cell;
    public endCell: Cell;
    public eaten: Piece;

    constructor(startCell: Cell, endCell: Cell) {
        this.piece = startCell.piece;
        this.startCell = startCell;
        this.endCell = endCell;
        this.eaten = endCell.piece;
    }
}

