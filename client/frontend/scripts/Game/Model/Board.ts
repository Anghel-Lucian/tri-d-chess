import AttackBoard from './AttackBoard';
import FullBoard from './FullBoard';
import Cell from './Cell';
import Piece from './Piece';

export default class Board {
    public pieces: Piece[];
    public attackBoards: AttackBoard[];
    public fullBoards: FullBoard[];
    public cells: Cell[]; // do we need this? how do we distinguish between the cells of a board vs another? Also the attack and full boards already have their cells array

    constructor(pieces: Piece[]) {
        this.pieces = pieces;
    }
}

