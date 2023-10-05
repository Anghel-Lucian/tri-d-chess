import {
    AttackBoardType,
    FULL_BOARD_DIMENSION,
    FullBoardType,
    PieceMap,
    PlayerColor
} from '../common';
import Cell from './Cell';
import AttackBoard from './AttackBoard';
import { SerializedFullBoard } from './common';

export default class FullBoard {
    public type: FullBoardType;
    public pieces: PieceMap;
    // TODO: doesn't this need to support 4 attack boards?
    public attackBoardLeft: AttackBoard;
    public attackBoardRight: AttackBoard;
    public cells: Cell[][];

    constructor(type: FullBoardType, pieces?: PieceMap, color?: PlayerColor) {
        this.type = type;

        this
            .initializeAttackBoards(pieces, color)
            .initializeCellsAndPieces(pieces);

    }

    private initializeAttackBoards(pieces: PieceMap, color: PlayerColor): FullBoard {
        if (this.type === FullBoardType.Top || this.type === FullBoardType.Bottom) {
            this.attackBoardLeft = new AttackBoard(AttackBoardType.Left, pieces, color); 
            this.attackBoardRight = new AttackBoard(AttackBoardType.Right, pieces, color); 
        }

        return this;
    }

    private initializeCellsAndPieces(pieces: PieceMap): FullBoard {
        this.pieces = {};
        this.cells = Array(FULL_BOARD_DIMENSION).fill([]).map(() => Array(FULL_BOARD_DIMENSION).fill([]));

        for (let row: number = 0; row < FULL_BOARD_DIMENSION; row++) {
            for (let column: number = 0; column < FULL_BOARD_DIMENSION; column++) { 

                if (this.type === FullBoardType.Top) {
                    if (row === 0 && column === 0) {
                        const piece = pieces.Knight0;

                        this.pieces.Knight0 = piece;
                        this.cells[row][column] = new Cell(row, column, this.type, piece, this.attackBoardLeft); 
                    } else if (row === 0 && column === 1) {
                        const piece = pieces.Bishop0;

                        this.pieces.Bishop0 = piece;
                        this.cells[row][column] = new Cell(row, column, this.type, piece); 
                    } else if (row === 0 && column === 2) {
                        const piece = pieces.Bishop1;

                        this.pieces.Bishop1 = piece;
                        this.cells[row][column] = new Cell(row, column, this.type, piece); 
                    } else if (row === 0 && column === 3) {
                        const piece = pieces.Knight1;

                        this.pieces.Knight1 = piece;
                        this.cells[row][column] = new Cell(row, column, this.type, piece, this.attackBoardRight); 
                    } else if (row === 1) {
                        const piece = pieces[`Pawn${column}` as keyof PieceMap];

                        this.pieces[`Pawn${column}` as keyof PieceMap] = piece;
                        this.cells[row][column] = new Cell(row, column, this.type, piece); 
                    } else {
                        this.cells[row][column] = new Cell(row, column, this.type);
                    }
                }

                if (this.type === FullBoardType.Bottom) {
                    if (row === 3 && column === 0) {
                        const piece = pieces.Knight0;

                        this.pieces.Knight0 = piece;
                        this.cells[row][column] = new Cell(row, column, this.type, piece, this.attackBoardLeft);
                    } else if (row === 3 && column === 1) {
                        const piece = pieces.Bishop0;

                        this.pieces.Bishop0 = piece;
                        this.cells[row][column] = new Cell(row, column, this.type, piece); 
                    } else if (row === 3 && column === 2) {
                        const piece = pieces.Bishop1;

                        this.pieces.Bishop1 = piece;
                        this.cells[row][column] = new Cell(row, column, this.type, piece); 
                    } else if (row === 3 && column === 3) {
                        const piece = pieces.Knight1;

                        this.pieces.Knight1 = piece;
                        this.cells[row][column] = new Cell(row, column, this.type, piece, this.attackBoardRight);
                    } else if (row === 2) {
                        const piece = pieces[`Pawn${column}` as keyof PieceMap];

                        this.pieces[`Pawn${column}` as keyof PieceMap] = piece;
                        this.cells[row][column] = new Cell(row, column, this.type, piece); 
                    } else {
                        this.cells[row][column] = new Cell(row, column, this.type);
                    }
                }

                if (this.type === FullBoardType.Middle) {
                    this.cells[row][column] = new Cell(row, column, this.type);
                }
            }
        }


        return this;
    }

    // TODO: change to reference equality using ===
    public hasAttackBoard(attackBoard: AttackBoard): boolean {
        if (this.attackBoardLeft?.type === attackBoard.type 
            && this.attackBoardLeft.color === attackBoard.color) {
            return true;
        } else if (this.attackBoardRight?.type === attackBoard.type
                   && this.attackBoardRight.color === attackBoard.color) {
            return true;
        }

        return false;
    }

    public getCellHostingAttackBoard(attackBoard: AttackBoard): Cell {
        for (let i: number = 0; i < FULL_BOARD_DIMENSION; i++) {
            for (let j: number = 0; i < FULL_BOARD_DIMENSION; j++) {
                if (this.cells[i][j].hostedAttackBoard === attackBoard) {
                    return this.cells[i][j];
                }
            }
        }

        return null;
    }

    /**
      * The attack board can rotate 180 degrees, such that it's cells' colors
      * align with the ones of the full board beneath it
      */
    public rotateAttackBoard(attackBoard: AttackBoard): FullBoard {
        if (!this.attackBoardLeft && !this.attackBoardRight) {
            return this;
        }

        let attackBoardSelected: AttackBoard;

        if (this.attackBoardLeft.type === attackBoard.type
            && this.attackBoardLeft.color === attackBoard.color) {
            attackBoardSelected = this.attackBoardLeft;
        } else if (this.attackBoardRight.type === attackBoard.type
                   && this.attackBoardRight.color === attackBoard.color) {
            attackBoardSelected = this.attackBoardRight;
        }

        attackBoardSelected.rotateSelf();

        return this;
    }

    public getSerialized(): SerializedFullBoard {
        return {
            cells: this.cells,
            attackBoardLeft: this.attackBoardLeft?.getSerialized(),
            attackBoardRight: this.attackBoardRight?.getSerialized(),
            type: this.type
        }
    }
}
