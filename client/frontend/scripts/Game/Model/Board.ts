import FullBoard from './FullBoard';
import { FullBoardType, PieceMap, PlayerColor } from '../common';

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
}

