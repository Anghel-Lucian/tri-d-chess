import AttackBoard from './AttackBoard';
import FullBoard from './FullBoard';
import Cell from './Cell';
import Piece from './Piece';

export default class Board {
    public whitePieces: Piece[];
    public blackPieces: Piece[];
    public attackBoards: AttackBoard[];
    public fullBoards: FullBoard[];
    public cells: Cell[]; // do we need this? how do we distinguish between the cells of a board vs another? Also the attack and full boards already have their cells array

    constructor(whitePieces: Piece[], blackPieces: Piece[]) {
        this.whitePieces = whitePieces;
        this.blackPieces = blackPieces;
    }

    private initializeFullBoards(): Board {
        // TODO: shall the full boards initialize their cells on their own? and then they initialize the attack boards? but the attack boards
        // need to be here as well because they can move across full boards

        return this;
    }

    private placePiecesOnBoards(): Board {
        return this;
    }
}

