import Cell from "../Model/Cell";
import Game from "../Model/Game";
import GameView from "../View/GameView";
import { SerializedBoards, SerializedFullBoard } from "../Model/common";
import { ViewData, ViewCell, ViewAttackBoard, ViewPiece } from "../View/utils";
import {
    ATTACK_BOARD_DIMENSION,
    AttackBoardType,
    FULL_BOARD_DIMENSION,
    FullBoardType,
    getPieceMapAlivePieces,
    getPieceMapDeadPieces
} from "../common";

export default class GameController {
    game: Game;
    data: ViewData;
    canvas: HTMLElement;
    view: GameView;

    constructor(usernamePlayerOne: string, idPlayerOne: string, usernamePlayerTwo: string, idPlayerTwo: string) {
        this.game = Game.getInstance(usernamePlayerOne, idPlayerOne, usernamePlayerTwo, idPlayerTwo);
        this.canvas = document.getElementById('game-container');

        this
            .formatViewData()
            .renderView();
    }

    private formatViewData(): GameController {
        const {fullBoardTop, fullBoardMiddle, fullBoardBottom}: SerializedBoards = this.game.getSerializedBoards(); 
        const {playerOne, playerTwo} = this.game.getPlayers();
        const whitePieces = this.game.getWhitePieces();
        const blackPieces = this.game.getBlackPieces();

        this.data = {} as ViewData;
        this.data.playerOne = {
            id: playerOne.id,
            username: playerOne.username,
            color: playerOne.color
        }

        this.data.playerTwo = {
            id: playerTwo.id,
            username: playerTwo.username,
            color: playerTwo.color
        }

        this.data.deadWhitePieces = getPieceMapDeadPieces(whitePieces);
        this.data.deadBlackPieces = getPieceMapDeadPieces(blackPieces);
        this.data.aliveWhitePieces = getPieceMapAlivePieces(whitePieces);
        this.data.aliveBlackPieces = getPieceMapAlivePieces(blackPieces);

        this.formatFullBoard(fullBoardTop);
        this.formatFullBoard(fullBoardMiddle);
        this.formatFullBoard(fullBoardBottom);

        return this;
    }

    private formatFullBoard(fullBoardData: SerializedFullBoard): GameController {
        const cells: ViewCell[] = [];
        const attackBoards: ViewAttackBoard[] = [];
        const fullBoardType = fullBoardData.type;

        for (let i = 0; i < FULL_BOARD_DIMENSION; i++) {
            for (let j = 0; j < FULL_BOARD_DIMENSION; j++) {
                cells.push(this.formatCell(fullBoardData.cells[i][j], fullBoardType));
            }
        }

        if (fullBoardData.attackBoardLeft) {
            const attackBoard: ViewAttackBoard = {} as ViewAttackBoard;
            const attackBoardCells: ViewCell[] = [];

            for (let i = 0; i < ATTACK_BOARD_DIMENSION; i++) {
                for (let j = 0; j < ATTACK_BOARD_DIMENSION; j++) {
                    attackBoardCells.push(this.formatCell(fullBoardData.attackBoardLeft.cells[i][j], AttackBoardType.Left));
                }
            }

            attackBoard.cells = attackBoardCells;
            attackBoard.type = fullBoardData.attackBoardLeft.type;
            attackBoard.color = fullBoardData.attackBoardLeft.color;
            attackBoard.captured = fullBoardData.attackBoardLeft.captured;

            attackBoards.push(attackBoard);
        }
            
        if (fullBoardData.attackBoardRight) {
            const attackBoard: ViewAttackBoard = {} as ViewAttackBoard;
            const attackBoardCells: ViewCell[] = [];

            for (let i = 0; i < ATTACK_BOARD_DIMENSION; i++) {
                for (let j = 0; j < ATTACK_BOARD_DIMENSION; j++) {
                    attackBoardCells.push(this.formatCell(fullBoardData.attackBoardRight.cells[i][j], AttackBoardType.Left));
                }
            }

            attackBoard.cells = attackBoardCells;
            attackBoard.type = fullBoardData.attackBoardRight.type;
            attackBoard.color = fullBoardData.attackBoardRight.color;
            attackBoard.captured = fullBoardData.attackBoardRight.captured;

            attackBoards.push(attackBoard);
        }

        if (fullBoardType === FullBoardType.Top) {
            this.data.fullBoardTop = {
                cells,
                attackBoards,
                type: fullBoardType
            }
        } else if (fullBoardType === FullBoardType.Middle) {
            this.data.fullBoardMiddle = {
                cells,
                attackBoards,
                type: fullBoardType
            }
        } else if (fullBoardType === FullBoardType.Bottom) {
            this.data.fullBoardBottom = {
                cells,
                attackBoards,
                type: fullBoardType
            }
        }

        return this;
    }

    private formatCell(rawCellData: Cell, boardType: FullBoardType | AttackBoardType): ViewCell {
        return {
            x: rawCellData.x,
            y: rawCellData.y,
            piece: rawCellData.piece ? {
                name: rawCellData.piece.name,
                color: rawCellData.piece.color
            } : null,
            boardType,
            hostedAttackBoard: rawCellData.hostedAttackBoard ? {
                type: rawCellData.hostedAttackBoard.type,
                color: rawCellData.hostedAttackBoard.color
            } : null
        }
    }

    private renderView(): GameController {
        this.view = GameView.getInstance(this.canvas);                  

        this.view.startRendering(this.data, this.getPiecePossibleMoves);

        return this;
    }

    private getPiecePossibleMoves(piece: ViewPiece, cell: ViewCell): ViewCell[] {
        console.log({
            piece,
            cell,
        });

        return [];
    }

}
