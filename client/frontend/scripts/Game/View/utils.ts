import { AttackBoardType, FullBoardType, PlayerColor, Piece } from "../common"

export interface ViewCell {
    x: number,
    y: number,
    piece: {
        name: string,
        color: PlayerColor
    },
    boardType: FullBoardType | AttackBoardType,
    hostedAttackBoard: {
        type: AttackBoardType,
        color: PlayerColor
    }
}

export interface ViewAttackBoard {
    cells: ViewCell[],
    type: AttackBoardType,
    color: PlayerColor,
    captured: boolean
}

export interface ViewFullBoard {
    cells: ViewCell[],
    attackBoards: ViewAttackBoard[],
    type: FullBoardType
}

export interface ViewData {
    playerOne: {
        id: string,
        username: string,
        color: PlayerColor 
    },
    playerTwo: {
        id: string,
        username: string,
        color: PlayerColor 
    },
    deadWhitePieces: Piece[],
    deadBlackPieces: Piece[],
    aliveWhitePieces: Piece[],
    aliveBlackPieces: Piece[],
    fullBoardTop: ViewFullBoard, 
    fullBoardMiddle: ViewFullBoard,
    fullBoardBottom: ViewFullBoard 
}

export interface ThreeDCoordinates {
    x: number,
    y: number,
    z: number
}
