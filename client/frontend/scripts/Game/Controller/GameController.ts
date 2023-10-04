import Cell from "../Model/Cell";
import Game from "../Model/Game";
import { SerializedBoards, SerializedFullBoard } from "../Model/common";
import { ViewData, ViewCell, ViewAttackBoard } from "../View/utils";
import { ATTACK_BOARD_DIMENSION, AttackBoardType, FULL_BOARD_DIMENSION, FullBoardType, PieceMap, PlayerColor, getPieceMapDeadPieces } from "../common";

export default class GameController {
    game: Game;
    data: ViewData;
    // TODO: the user info would come from another place. Like the user wants a session
    // he initializes this wish. Then a sessioning service responds to both users
    // and gives information to each about the other
    constructor(usernamePlayerOne: string, idPlayerOne: string, usernamePlayerTwo: string, idPlayerTwo: string) {
        this.game = Game.getInstance(usernamePlayerOne, idPlayerOne, usernamePlayerTwo, idPlayerTwo);
        
        const viewData = this.formatViewData();

    }

    private formatViewData() {
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



        // TODO: the boards, see ViewData interface from view commons
        console.log(this.data);
        console.log(fullBoardTop);
        console.log(fullBoardMiddle);
        console.log(fullBoardBottom);

    }

    private formatFullBoards(fullBoardData: SerializedFullBoard, fullBoardType: FullBoardType) {
        const cells: ViewCell[] = [];
        const attackBoards: ViewAttackBoard[] = [];

        for (let i = 0; i < FULL_BOARD_DIMENSION; i++) {
            for (let j = 0; j < FULL_BOARD_DIMENSION; i++) {
                cells.push(this.formatCell(fullBoardData.cells[i][j], fullBoardType));
            }
        }

        if (fullBoardData.attackBoardLeft) {
            const attackBoard: ViewAttackBoard = {} as ViewAttackBoard;
            const attackBoardCells: ViewCell[] = [];

            for (let i = 0; i < ATTACK_BOARD_DIMENSION; i++) {
                for (let j = 0; j < ATTACK_BOARD_DIMENSION; i++) {
                    attackBoardCells.push(this.formatCell(fullBoardData.attackBoardLeft.cells[i][j], AttackBoardType.Left));
                }
            }

            attackBoard.cells = attackBoardCells;
            attackBoard.type = fullBoardData.attackBoardLeft.type;
            attackBoard.color = fullBoardData.attackBoardLeft.color;

            attackBoards.push(attackBoard);
        }
            
        if (fullBoardData.attackBoardRight) {
            const attackBoard: ViewAttackBoard = {} as ViewAttackBoard;
            const attackBoardCells: ViewCell[] = [];

            for (let i = 0; i < ATTACK_BOARD_DIMENSION; i++) {
                for (let j = 0; j < ATTACK_BOARD_DIMENSION; i++) {
                    attackBoardCells.push(this.formatCell(fullBoardData.attackBoardRight.cells[i][j], AttackBoardType.Left));
                }
            }

            attackBoard.cells = attackBoardCells;
            attackBoard.type = fullBoardData.attackBoardRight.type;
            attackBoard.color = fullBoardData.attackBoardRight.color;

            attackBoards.push(attackBoard);
        }

        // TODO: add cells and attack boards to the correct full board in ViewData
    }

    private formatCell(rawCellData: Cell, boardType: FullBoardType | AttackBoardType): ViewCell {
        return {
            x: rawCellData.x,
            y: rawCellData.y,
            piece: {
                name: rawCellData.piece.name,
                color: rawCellData.piece.color
            },
            boardType,
            hostedAttackBoard: {
                type: rawCellData.hostedAttackBoard?.type,
                color: rawCellData.hostedAttackBoard?.color
            }
        }
    }

}
