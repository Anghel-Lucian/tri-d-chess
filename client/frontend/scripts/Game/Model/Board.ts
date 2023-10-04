import FullBoard from './FullBoard';
import Move from './Move';
import Cell from './Cell';
import { FullBoardType, PieceMap, PlayerColor } from '../common';
import AttackBoard from './AttackBoard';
import { SerializedBoards } from './common';

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

    private getAttackBoardHost(attackBoard: AttackBoard): FullBoard {
        if (this.fullBoardTop.hasAttackBoard(attackBoard)) {
            return this.fullBoardTop;
        } else if (this.fullBoardMiddle.hasAttackBoard(attackBoard)) {
            return this.fullBoardMiddle;
        } else if (this.fullBoardBottom.hasAttackBoard(attackBoard)) {
            return this.fullBoardBottom;
        }
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
        this.getAttackBoardHost(attackBoard).rotateAttackBoard(attackBoard);        

        return this;
    }

    // TODO: Finish implementing this, careful that the destination can be in other boards as well
    // Verification that the attack board has only one piece and partains to a particular player should be
    // done somewhere else. Also, verify that there's no other attack board in the destination cell
    public moveAttackBoard(attackBoard: AttackBoard, destination: Cell): Board {
        const attackBoardHost: FullBoard = this.getAttackBoardHost(attackBoard);
        const attackBoardHostCell: Cell = attackBoardHost.getCellHostingAttackBoard(attackBoard);

        if (!destination.hostedAttackBoard) {
            destination.hostedAttackBoard = attackBoard;
            attackBoardHostCell.hostedAttackBoard = null;
        }

        return this;
    }

    public getSerialized(): SerializedBoards{
        return {
            fullBoardTop: this.fullBoardTop.getSerialized(),
            fullBoardMiddle: this.fullBoardMiddle.getSerialized(),
            fullBoardBottom: this.fullBoardBottom.getSerialized()
        };
    }
}

