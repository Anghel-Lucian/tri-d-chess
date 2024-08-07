import Cell from "../Model/Cell";
import Game from "../Model/Game";
import GameView from "../View/GameView";
import { SerializedBoards, SerializedFullBoard } from "../Model/common";
import { ViewData, ViewCell, ViewAttackBoard, ViewPiece, ViewFullBoard } from "../View/utils";
import {
    ATTACK_BOARD_DIMENSION,
    AttackBoardType,
    BoardType,
    FULL_BOARD_DIMENSION,
    FullBoardType,
    PieceName,
    PlayerColor,
    getPieceMapAlivePieces,
    getPieceMapDeadPieces
} from "../common";


type PieceMoveOffset = {
    x: number,
    y: number
};

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

        if (fullBoardData.attackBoardLeft) {
            const attackBoard: ViewAttackBoard = {} as ViewAttackBoard;
            const attackBoardCells: ViewCell[] = [];

            attackBoard.type = fullBoardData.attackBoardLeft.type;
            attackBoard.color = fullBoardData.attackBoardLeft.color;
            attackBoard.captured = fullBoardData.attackBoardLeft.captured;
            attackBoard.id = fullBoardData.attackBoardLeft.id;

            for (let i = 0; i < ATTACK_BOARD_DIMENSION; i++) {
                for (let j = 0; j < ATTACK_BOARD_DIMENSION; j++) {
                    attackBoardCells.push(this.formatCell(
                        fullBoardData.attackBoardLeft.cells[i][j],
                        AttackBoardType.Left,
                        BoardType.Attack,
                        attackBoard
                    ));
                }
            }

            attackBoard.cells = attackBoardCells;

            attackBoards.push(attackBoard);
        }
            
        if (fullBoardData.attackBoardRight) {
            const attackBoard: ViewAttackBoard = {} as ViewAttackBoard;
            const attackBoardCells: ViewCell[] = [];

            attackBoard.type = fullBoardData.attackBoardRight.type;
            attackBoard.color = fullBoardData.attackBoardRight.color;
            attackBoard.captured = fullBoardData.attackBoardRight.captured;
            attackBoard.id = fullBoardData.attackBoardRight.id;

            for (let i = 0; i < ATTACK_BOARD_DIMENSION; i++) {
                for (let j = 0; j < ATTACK_BOARD_DIMENSION; j++) {
                    attackBoardCells.push(this.formatCell(
                        fullBoardData.attackBoardRight.cells[i][j],
                        AttackBoardType.Right,
                        BoardType.Attack,
                        attackBoard
                    ));
                }
            }

            attackBoard.cells = attackBoardCells;

            attackBoards.push(attackBoard);
        }

        for (let i = 0; i < FULL_BOARD_DIMENSION; i++) {
            for (let j = 0; j < FULL_BOARD_DIMENSION; j++) {
                if (fullBoardData.cells[i][j].hostedAttackBoard?.type === fullBoardData.attackBoardLeft?.type) {
                    cells.push(this.formatCell(
                        fullBoardData.cells[i][j],
                        fullBoardType, 
                        BoardType.Full, 
                        attackBoards.find(b => b.type === fullBoardData.attackBoardLeft.type)
                    ));
                } else if (fullBoardData.cells[i][j].hostedAttackBoard?.type === fullBoardData.attackBoardRight?.type) {
                    cells.push(this.formatCell(
                        fullBoardData.cells[i][j],
                        fullBoardType, 
                        BoardType.Full, 
                        attackBoards.find(b => b.type === fullBoardData.attackBoardRight.type)
                    ));
                } else {
                    cells.push(this.formatCell(fullBoardData.cells[i][j], fullBoardType, BoardType.Full, null));
                }
            }
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

    private formatCell(
        rawCellData: Cell, 
        specificBoardType: FullBoardType | AttackBoardType,
        boardType: BoardType,
        attackBoard: ViewAttackBoard
    ): ViewCell {
        return {
            x: rawCellData.x,
            y: rawCellData.y,
            piece: rawCellData.piece ? {
                name: rawCellData.piece.name,
                color: rawCellData.piece.color
            } : null,
            boardType: specificBoardType,
            hostedAttackBoard: attackBoard, // can be null
            isOnAttackBoard: boardType === BoardType.Attack,
            attackBoardId: boardType === BoardType.Attack ? attackBoard.id : null,
            object: null,
            renderedColor: null
        }
    }

    private renderView(): GameController {
        this.view = GameView.getInstance(this.canvas);                  

        this.view.startRendering(this.data, this.getPiecePossibleMoves.bind(this));

        return this;
    }

    // TODO: you need to account for obstacles (i.e., other pieces, except for knight cause he can jump over)
    // TODO: need to handle moving across boards
    // TODO: cover case where there are friendly or enemy pieces on the cells
    private getPiecePossibleMoves(piece: ViewPiece, cell: ViewCell): ViewCell[] {
        console.log({
            piece,
            cell,
        });
        const possibleCells: ViewCell[] = [];
        this.pushCellsAboveAndBelow(cell, possibleCells);

        console.log({possibleCells});

        let cells: ViewCell[] = [];
    
        if (cell.isOnAttackBoard) {
            const attackBoard = this.getAttackBoardFromAttackBoardCell(cell);

            cells = attackBoard.cells;
        } else if (cell.boardType === FullBoardType.Bottom) {
            cells = this.data.fullBoardBottom.cells;
        } else if (cell.boardType === FullBoardType.Middle) {
            cells = this.data.fullBoardMiddle.cells;
        } else if (cell.boardType === FullBoardType.Top) {
            cells = this.data.fullBoardTop.cells;
        } 

        console.log({cells});

        for (const c of cells) {
            const moveOffsets = this.getMoveOffsetBasedOnPiece(piece);

            for (const {x, y} of moveOffsets) {
                console.log({
                    cell,
                    c,
                    x,
                    y,
                    black: piece.color === PlayerColor.Black
                });

                if (cell.x + x === c.x && cell.y + y === c.y) {
                    possibleCells.push(c);
                }
            }
        }

        const finalCells = [];

        for (const c of possibleCells) {
            if (c.piece?.color === piece.color) {
                continue;
            }

            if (cell.piece.name === PieceName.Knight) {
                finalCells.push(c);
                continue;
            }

            if (!this.cellPathIsObstructed(cell, c)) {
                finalCells.push(c);
            }
        }

        return finalCells;
    }

    private pushCellsAboveAndBelow(cell: ViewCell, cells: ViewCell[]) {
        if (cell.isOnAttackBoard) {
            const cellHostingAttackBoard = this.getCellHostingAttackBoardById(cell.attackBoardId); 

            if ((cellHostingAttackBoard.x === 0 && cellHostingAttackBoard.y === 0 && cell.x === 1 && cell.y === 1) ||
                (cellHostingAttackBoard.x === 0 && cellHostingAttackBoard.y === 3 && cell.x === 1 && cell.y === 0) ||
                (cellHostingAttackBoard.x === 3 && cellHostingAttackBoard.y === 0 && cell.x === 0 && cell.y === 1) ||
                (cellHostingAttackBoard.x === 3 && cellHostingAttackBoard.y === 3 && cell.x === 0 && cell.y === 0))
                {
                    cells.push(cellHostingAttackBoard);
                } 
        } else {
            if (cell.boardType === FullBoardType.Bottom) {
                if (cell.x >= 2) {
                    for (const c of this.data.fullBoardMiddle.cells) {
                        if (c.x === cell.x - 2 && c.y === cell.y) {
                            cells.push(c); 
                        }
                    }
                }
            } else if (cell.boardType === FullBoardType.Middle) {
                if (cell.x < 2) {
                    for (const c of this.data.fullBoardBottom.cells) {
                        if (c.x === cell.x + 2 && c.y === cell.y) {
                            cells.push(c);
                        }
                    }
                } else {
                    for (const c of this.data.fullBoardTop.cells) {
                        if (c.x === cell.x - 2 && c.y === cell.y) {
                            cells.push(c);
                        }
                    }
                }
            } else if (cell.boardType === FullBoardType.Top) {
                if (cell.x < 2) {
                    for (const c of this.data.fullBoardMiddle.cells) {
                        if (c.x === cell.x + 2 && c.y === cell.y) {
                            cells.push(c);
                        }
                    }
                }
            }

            if (cell.hostedAttackBoard) {
                if (cell.x === 0 && cell.y === 0) {
                    for (const c of cell.hostedAttackBoard.cells) {
                        if (c.x === 1 && c.y === 1) {
                            cells.push(c);
                        }
                    }
                } else if (cell.x === 3 && cell.y === 0) {
                    for (const c of cell.hostedAttackBoard.cells) {
                        if (c.x === 0 && c.y === 1) {
                            cells.push(c); 
                        }
                    }
                } else if (cell.x === 0 && cell.y === 3) {
                    for (const c of cell.hostedAttackBoard.cells) {
                        if (c.x === 1 && c.y === 0) {
                            cells.push(c); 
                        }
                    }
                } else if (cell.x === 3 && cell.y === 3) {
                    for (const c of cell.hostedAttackBoard.cells) {
                        if (c.x === 0 && c.y === 0) {
                            cells.push(c); 
                        }
                    }
                }
            }
        }

        return cells;
    }

    private getMoveOffsetBasedOnPiece(piece: ViewPiece): PieceMoveOffset[] {
        const moveOffsets: PieceMoveOffset[] = [];

        switch (piece.name) {
            case PieceName.Pawn:
                if (piece.color === PlayerColor.Black) {
                    moveOffsets.push({
                        x: 1,
                        y: 0
                    });
                } else {
                    moveOffsets.push({
                        x: -1,
                        y: 0
                    });
                }
                break;
            case PieceName.Knight:
                moveOffsets.push({
                    x: 2,
                    y: -1
                });
                moveOffsets.push({
                    x: 2,
                    y: 1
                });
                moveOffsets.push({
                    x: -2,
                    y: 1
                });
                moveOffsets.push({
                    x: -2,
                    y: -1
                });
                break;
            case PieceName.Rook:
                for (let i = 1; i <= 3; i++) {
                    moveOffsets.push({
                        x: i,
                        y: 0
                    });
                    moveOffsets.push({
                        x: -i,
                        y: 0
                    });
                    moveOffsets.push({
                        x: 0,
                        y: i
                    });
                    moveOffsets.push({
                        x: 0,
                        y: -i
                    });
                }
                break;
            case PieceName.Bishop:
                for (let i = 1; i <= 3; i++) {
                    moveOffsets.push({
                        x: i,
                        y: i
                    });
                    moveOffsets.push({
                        x: -i,
                        y: -i
                    });
                    moveOffsets.push({
                        x: -i,
                        y: i
                    });
                    moveOffsets.push({
                        x: i,
                        y: -i
                    });
                }
                break;
            case PieceName.Queen:
                for (let i = 1; i <= 3; i++) {
                    moveOffsets.push({
                        x: i,
                        y: 0
                    });
                    moveOffsets.push({
                        x: -i,
                        y: 0
                    });
                    moveOffsets.push({
                        x: 0,
                        y: i
                    });
                    moveOffsets.push({
                        x: 0,
                        y: -i
                    });
                    moveOffsets.push({
                        x: i,
                        y: i
                    });
                    moveOffsets.push({
                        x: -i,
                        y: -i
                    });
                    moveOffsets.push({
                        x: -i,
                        y: i
                    });
                    moveOffsets.push({
                        x: i,
                        y: -i
                    });
                }
                break;
            case PieceName.King:
                moveOffsets.push({
                    x: 1,
                    y: 0
                });
                moveOffsets.push({
                    x: -1,
                    y: 0
                });
                moveOffsets.push({
                    x: 0,
                    y: 1
                });
                moveOffsets.push({
                    x: 0,
                    y: -1
                });
                moveOffsets.push({
                    x: 1,
                    y: 1
                });
                moveOffsets.push({
                    x: -1,
                    y: -1
                });
                moveOffsets.push({
                    x: -1,
                    y: 1
                });
                moveOffsets.push({
                    x: 1,
                    y: -1
                });
                break;
            default:
                break;
        }

        return moveOffsets;
    }

    private getAttackBoardFromAttackBoardCell(cell: ViewCell): ViewAttackBoard {
        for (const fullBoard of [this.data.fullBoardBottom, this.data.fullBoardMiddle, this.data.fullBoardTop]) {
            for (const c of fullBoard.cells) {
                if (c.hostedAttackBoard?.id === cell.attackBoardId) {
                    return c.hostedAttackBoard;
                }
            }
        }

        return null;
    }

    private getCellHostingAttackBoardById(attackBoardId: string): ViewCell {
        for (const fullBoard of [this.data.fullBoardBottom, this.data.fullBoardMiddle, this.data.fullBoardTop]) {
            for (const c of fullBoard.cells) {
                if (c.hostedAttackBoard?.id === attackBoardId) {
                    return c;
                }
            }
        }

        return null;
    }
   
    // TODO: test this part by having two enemy pieces on the same baord.
    // Cells after the enemy piece should not be highlighted, but the cell
    // that's holding the enemy piece should be
    private cellPathIsObstructed(start: ViewCell, end: ViewCell): boolean {
        if (this.cellsAreOnDifferentBoards(start, end)) {
            return false;
        }

        const board = this.getBoardFromCell(start);

        if (start.x === end.x) {
            if (start.y < end.y) {
                for (let i = 1; i < end.y - start.y; i++) {
                    for (const c of board.cells) {
                        if (c.x === start.x &&
                            c.y === start.y + i &&
                            c.piece) {
                            return true; 
                        }
                    }
                }
            } else {
                for (let i = 1; i < start.y - end.y; i++) {
                    for (const c of board.cells) {
                        if (c.x === start.x &&
                            c.y === start.y - i &&
                            c.piece) {
                            return true;
                        }
                    }
                }
            }
        } else if (start.y === end.y) {
            if (start.x < end.x) {
                for (let i = 1; i < end.x - start.x; i++) {
                    for (const c of board.cells) {
                        if (c.y === start.y &&
                            c.x === start.x + i &&
                            c.piece) {
                            return true; 
                        }
                    }
                }
            } else {
                for (let i = 1; i < start.x - end.x; i++) {
                    for (const c of board.cells) {
                        if (c.y === start.y &&
                            c.x === start.x - i &&
                            c.piece) {
                            return true;
                        }
                    }
                }
            }
        } else {
            // we know that end.x/y and start.x/y cannot be equal
            // because of the branches above
            const endXIsSmaller = end.x < start.x;
            const endYIsSmaller = end.y < start.y;

            for (let i = 1; i < Math.abs(start.x - end.x); i++) {
                for (const c of board.cells) {
                    let adjustedStartXEqualToCX = false;
                    let adjustedStartYEqualToCY = false;
                    
                    if (endXIsSmaller) {
                        adjustedStartXEqualToCX = start.x - i === c.x;
                    } else {
                        adjustedStartXEqualToCX = start.x + i === c.x;
                    }

                    if (endYIsSmaller) {
                        adjustedStartYEqualToCY = start.y - i === c.y;
                    } else {
                        adjustedStartYEqualToCY = start.y + i === c.y;
                    }

                    if (adjustedStartXEqualToCX && adjustedStartYEqualToCY && c.piece) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private getBoardFromCell(cell: ViewCell): ViewFullBoard | ViewAttackBoard {
        if (cell.isOnAttackBoard) {
            for (const fullBoard of [this.data.fullBoardBottom, this.data.fullBoardMiddle, this.data.fullBoardTop]) {
                for (const c of fullBoard.cells) {
                    if (c.hostedAttackBoard?.id === cell.attackBoardId) {
                        return c.hostedAttackBoard;
                    }
                }
            }
        }

        let board = null;

        if (cell.boardType === FullBoardType.Bottom) {
            board = this.data.fullBoardBottom;
        } else if (cell.boardType === FullBoardType.Middle) {
            board = this.data.fullBoardMiddle;
        } else {
            board = this.data.fullBoardTop;
        }

        return board;
    }

    private cellsAreOnDifferentBoards(cell1: ViewCell, cell2: ViewCell): boolean {
        if (cell1.isOnAttackBoard !== cell2.isOnAttackBoard) {
            return true;
        } else if (cell1.isOnAttackBoard) {
            if (cell1.attackBoardId !== cell2.attackBoardId) {
                return true;
            }
        } else {
            if (cell1.boardType !== cell2.boardType) {
                return true;
            }
        }

        return false;
    }
}
