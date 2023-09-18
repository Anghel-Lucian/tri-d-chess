import { PieceMap, PlayerColor } from "../common";
import Piece from "./Piece";

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
}
