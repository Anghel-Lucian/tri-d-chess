import FullBoard from './FullBoard';
import Move from './Move';
import { FullBoardType, PieceMap, PlayerColor } from '../common';
import AttackBoard from './AttackBoard';

export default class Board {
    public whitePieces: PieceMap;
    public blackPieces: PieceMap;
    public fullBoardTop: FullBoard;
    public fullBoardMiddle: FullBoard;
    public fullBoardBottom: FullBoard;

    constructor(whitePieces: PieceMap, blackPieces: PieceMap) {
        this.whitePieces = whitePieces;
        this.blackPieces = blackPieces;

        this.initializeFullBoards();
    }

    private initializeFullBoards(): Board {
        this.fullBoardTop = new FullBoard(FullBoardType.Top, this.whitePieces, PlayerColor.White);
        this.fullBoardMiddle = new FullBoard(FullBoardType.Middle);
        this.fullBoardBottom = new FullBoard(FullBoardType.Bottom, this.blackPieces, PlayerColor.Black);

        return this;
    }

    public makeMove(move: Move): Board {
        const startCell = move.startCell; 
        const endCell = move.endCell;

        if (endCell.piece) {
            endCell.piece.dead = true;
        }

        endCell.piece = startCell.piece;
        startCell.piece = null;


        return this;
    }

    public rotateAttackBoard(attackBoard: AttackBoard): Board {
        if (this.fullBoardTop.hasAttackBoard(attackBoard)) {
            this.fullBoardTop.rotateAttackBoard(attackBoard);
        } else if (this.fullBoardMiddle.hasAttackBoard(attackBoard)) {
            this.fullBoardMiddle.rotateAttackBoard(attackBoard);
        } else if (this.fullBoardBottom.hasAttackBoard(attackBoard)) {
            this.fullBoardBottom.rotateAttackBoard(attackBoard);
        }

        return this;
    }
}

