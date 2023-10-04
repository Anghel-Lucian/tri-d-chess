import Cell from "./Cell"
import { AttackBoardType, FullBoardType, PlayerColor } from "../common"

export interface SerializedAttackBoard {
    cells: Cell[][],
    color: PlayerColor,
    captured: boolean,
    type: AttackBoardType
}

export interface SerializedFullBoard {
        cells: Cell[][],
        attackBoardLeft: SerializedAttackBoard,
        attackBoardRight: SerializedAttackBoard,
        type: FullBoardType
}

export interface SerializedBoards {
    fullBoardTop: SerializedFullBoard,
    fullBoardMiddle: SerializedFullBoard, 
    fullBoardBottom: SerializedFullBoard
}


