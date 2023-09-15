import {AttackBoardType, PlayerColor} from '../common';
import Piece from './Piece';
import Cell from './Cell';

export default class AttackBoard {
    public type: AttackBoardType;
    public pieces: Piece[];
    public color: PlayerColor;
    public cells: Cell[];
    public position: Cell;

    constructor(type: AttackBoardType, pieces: Piece[], color: PlayerColor, position: Cell) {
        this.type = type;
        this.pieces = pieces;
        this.color = color;
        this.position = position;
    }

}
