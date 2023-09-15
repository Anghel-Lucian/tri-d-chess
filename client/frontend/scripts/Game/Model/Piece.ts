import {PieceName, PlayerColor} from '../common';

export default class Piece {
    name: PieceName;
    color: PlayerColor;
    dead: boolean;

    constructor(name: PieceName, color: PlayerColor) {
        this.name = name;
        this.color = color;
    }

}
