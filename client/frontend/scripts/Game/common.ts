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

export enum BoardType {
    Attack,
    Full
}

export const FULL_BOARD_DIMENSION = 4;
export const ATTACK_BOARD_DIMENSION = 2;
// Full boards place the first 4 pawns, and then the attack boards take the rest
export const ATTACK_BOARD_PAWN_INDEX_OFFSET = 4;
// Left attack boards place 2 pawns, the right attack board takes the rest
export const ATTACK_BOARD_RIGHT_PAWN_INDEX_OFFSET = 2;
// If one player has only the king left, the other has only 5 moves to checkmate him
export const MOVES_TILL_STALL = 10;

export interface Piece {
    name: PieceName;
    color: PlayerColor;
    dead: boolean;
}

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

export function getPieceMapValues(pieceMap: PieceMap): Piece[] {
    if (!pieceMap) {
        return [];
    }

    return [
        pieceMap.King,
        pieceMap.Queen,
        pieceMap.Rook0,
        pieceMap.Rook1,
        pieceMap.Bishop0,
        pieceMap.Bishop1,
        pieceMap.Knight0,
        pieceMap.Knight1,
        pieceMap.Pawn0,
        pieceMap.Pawn1,
        pieceMap.Pawn2,
        pieceMap.Pawn3,
        pieceMap.Pawn4,
        pieceMap.Pawn5,
        pieceMap.Pawn6,
        pieceMap.Pawn7,
    ];
}

export function getPieceMapDeadPieces(pieceMap: PieceMap): Piece[] {
    const pieces: Piece[] = getPieceMapValues(pieceMap);

    return pieces.filter((piece: Piece) => piece.dead);
}

export function getPieceMapAlivePieces(pieceMap: PieceMap): Piece[] {
    const pieces: Piece[] = getPieceMapValues(pieceMap);

    return pieces.filter((piece: Piece) => !piece.dead);
}

