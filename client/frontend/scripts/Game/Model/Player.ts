import { Piece, PieceMap, PieceName, PlayerColor, getPieceMapAlivePieces } from "../common";

export default class Player {
    public username: string;
    public id: string;
    public color: PlayerColor;
    public pieces: PieceMap; 

    constructor(username: string, id: string, color: PlayerColor, pieces: PieceMap) {
        this.username = username;
        this.id = id;
        this.color = color;
        this.pieces = pieces;
    }

    public hasKingOnly(): boolean {
        const alivePieces: Piece[] = getPieceMapAlivePieces(this.pieces);

        return alivePieces.length === 1 && alivePieces[0].name === PieceName.King;
    }
}
