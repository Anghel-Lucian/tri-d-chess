import {PieceName, PlayerColor} from '../common';
import Cell from './Cell';

export default class Piece {
    name: PieceName;
    color: PlayerColor;
    cell: Cell;
    dead: boolean;

    constructor(name: PieceName, color: PlayerColor, cell: Cell) {
        this.name = name;
        this.color = color;
        this.cell = cell;
    }

}
