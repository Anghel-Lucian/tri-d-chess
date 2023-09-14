import {FullBoardType} from '../common';
import Piece from './Piece';
import Cell from './Cell';

export default class FullBoard {
    public type: FullBoardType;
    public pieces: Piece[];
    public cells: Cell[];

    constructor(type: FullBoardType, pieces: Piece[]) {
        this.type = type;
        this.pieces = pieces;
    }

}
