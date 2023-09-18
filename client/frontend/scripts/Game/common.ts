import Piece from "./Model/Piece";

export enum PlayerColor {
    Black,
    White
}

export enum PieceName {
    King = "King",
    Queen = "Queen",
    Rook = "Rook",
    Bishop = "Bishop",
    Knight = "Knight",
    Pawn = "Pawn"
}

export enum AttackBoardType {
    Left,
    Right
}

export enum FullBoardType {
    Top,
    Middle,
    Bottom
}

export const FULL_BOARD_DIMENSION = 4;
export const ATTACK_BOARD_DIMENSION = 2;
// Full boards place the first 4 pawns, and then the attack boards take the rest
export const ATTACK_BOARD_PAWN_INDEX_OFFSET = 4;
// Left attack boards place 2 pawns, the right attack board takes the rest
export const ATTACK_BOARD_RIGHT_PAWN_INDEX_OFFSET = 2;

export interface PieceMap {
    King?: Piece;
    Queen?: Piece;
    Rook0?: Piece;
    Rook1?: Piece;
    Bishop0?: Piece;
    Bishop1?: Piece;
    Knight0?: Piece;
    Knight1?: Piece;
    Pawn0?: Piece;
    Pawn1?: Piece;
    Pawn2?: Piece;
    Pawn3?: Piece;
    Pawn4?: Piece;
    Pawn5?: Piece;
    Pawn6?: Piece;
    Pawn7?: Piece;
}
