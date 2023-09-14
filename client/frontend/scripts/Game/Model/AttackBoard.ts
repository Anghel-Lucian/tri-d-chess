import {AttackBoardType, PlayerColor} from '../common';
import Piece from './Piece';
import Cell from './Cell';

export default class AttackBoard {
    public type: AttackBoardType;
    public pieces: Piece[];
    public color: PlayerColor;
    public cells: Cell[];

    constructor(type: AttackBoardType, pieces: Piece[], color: PlayerColor) {
        this.type = type;
        this.pieces = pieces;
        this.color = color;
    }

}
