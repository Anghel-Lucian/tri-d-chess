import {
    ATTACK_BOARD_DIMENSION,
    ATTACK_BOARD_PAWN_INDEX_OFFSET,
    ATTACK_BOARD_RIGHT_PAWN_INDEX_OFFSET,
    AttackBoardType,
    PieceMap,
    PlayerColor
} from '../common';
import Cell from './Cell';

export default class AttackBoard {
    public type: AttackBoardType;
    public pieces: PieceMap;
    public color: PlayerColor;
    public cells: Cell[][];

    constructor(type: AttackBoardType, pieces: PieceMap, color: PlayerColor) {
        this.type = type;
        this.color = color;

        this.initializeCellsAndPieces(pieces);
    }

    private initializeCellsAndPieces(pieces: PieceMap): AttackBoard {
        for (let row: number = 0; row < ATTACK_BOARD_DIMENSION; row++) {
            for (let column: number = 0; column < ATTACK_BOARD_DIMENSION; column++) { 
                if (this.type === AttackBoardType.Left) {
                    if (this.color === PlayerColor.White) {
                        if (row === 0 && column === 0) {
                            const piece = pieces.Rook0;

                            this.pieces.Rook0 = piece;
                            this.cells[row][column] = new Cell(row, column, this.type, piece); 
                        } else if (row === 0 && column === 1) {
                            const piece = pieces.King;

                            this.pieces.King = piece;
                            this.cells[row][column] = new Cell(row, column, this.type, piece); 
                        } else if (row === 1) {
                            const piece = pieces[`Pawn${column + ATTACK_BOARD_PAWN_INDEX_OFFSET}` as keyof PieceMap];

                            this.pieces[`Pawn${column + ATTACK_BOARD_PAWN_INDEX_OFFSET}` as keyof PieceMap] = piece;
                            this.cells[row][column] = new Cell(row, column, this.type, piece); 
                        }
                    } else {
                        if (row === 1 && column === 0) {
                            const piece = pieces.Rook0;

                            this.pieces.Rook0 = piece;
                            this.cells[row][column] = new Cell(row, column, this.type, piece); 
                        } else if (row === 1 && column === 1) {
                            const piece = pieces.King;

                            this.pieces.King = piece;
                            this.cells[row][column] = new Cell(row, column, this.type, piece); 
                        } else if (row === 0) {
                            const piece = pieces[`Pawn${column + ATTACK_BOARD_PAWN_INDEX_OFFSET}` as keyof PieceMap];

                            this.pieces[`Pawn${column + ATTACK_BOARD_PAWN_INDEX_OFFSET}` as keyof PieceMap] = piece;
                            this.cells[row][column] = new Cell(row, column, this.type, piece); 
                        }
                    }
                }

                if (this.type === AttackBoardType.Right) {
                    if (this.color === PlayerColor.White) {
                        if (row === 0 && column === 0) {
                            const piece = pieces.Queen;

                            this.pieces.Queen = piece;
                            this.cells[row][column] = new Cell(row, column, this.type, piece); 
                        } else if (row === 0 && column === 1) {
                            const piece = pieces.Rook1;

                            this.pieces.Rook1 = piece;
                            this.cells[row][column] = new Cell(row, column, this.type, piece); 
                        } else if (row === 1) {
                            const pieceKey = `Pawn${column + ATTACK_BOARD_PAWN_INDEX_OFFSET + ATTACK_BOARD_RIGHT_PAWN_INDEX_OFFSET}`;
                            const piece = pieces[pieceKey as keyof PieceMap];

                            this.pieces[pieceKey as keyof PieceMap] = piece;
                            this.cells[row][column] = new Cell(row, column, this.type, piece); 
                        }
                    } else {
                        if (row === 1 && column === 0) {
                            const piece = pieces.Queen;

                            this.pieces.Queen = piece;
                            this.cells[row][column] = new Cell(row, column, this.type, piece); 
                        } else if (row === 1 && column === 1) {
                            const piece = pieces.Rook1;

                            this.pieces.Rook1 = piece;
                            this.cells[row][column] = new Cell(row, column, this.type, piece); 
                        } else if (row === 0) {
                            const pieceKey = `Pawn${column + ATTACK_BOARD_PAWN_INDEX_OFFSET + ATTACK_BOARD_RIGHT_PAWN_INDEX_OFFSET}`;
                            const piece = pieces[pieceKey as keyof PieceMap];

                            this.pieces[pieceKey as keyof PieceMap] = piece;
                            this.cells[row][column] = new Cell(row, column, this.type, piece); 
                        }
                    }
                }
            }
        }

        return this;
    }

    /**
      * Attack boards may rotate 180 degrees, such that
      * the colors of its cells will match with those beneath (the full board's)
      */
    public rotateSelf(): AttackBoard {    
        const [
            pieceTopLeft,
            pieceTopRight,
            pieceBottomLeft,
            pieceBottomRight
        ] = [this.cells[0][0].piece, this.cells[0][1].piece, this.cells[1][0].piece, this.cells[1][1].piece];

        this.cells[0][0].piece = pieceBottomRight;
        this.cells[0][1].piece = pieceBottomLeft;
        this.cells[1][0].piece = pieceTopRight;
        this.cells[1][1].piece = pieceTopLeft;

        return this;
    }
}
