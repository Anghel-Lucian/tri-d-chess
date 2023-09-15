import { PlayerColor } from "../common";
import Piece from "./Piece";

export default class Player {
    public username: string;
    public id: string;
    public color: PlayerColor;
    public pieces: Piece[]

    constructor(username: string, id: string, color: PlayerColor, pieces: Piece[]) {
        this.username = username;
        this.id = id;
        this.color = color;
        this.pieces = pieces;
    }
}
