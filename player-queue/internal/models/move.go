package models

import (
    "fmt"
)

// TODO: the Move struct and all its associated operations could
// be used to store it into an active_game_moves table. This is a
// feature that won't be implemented atm, we'll only keep track of who's
// turn it is, and so all the validation regarding who's one or not will be
// done in the UI
type PieceName string;
type Color string;
type AttackBoardType string;
type FullBoardType string;

const (
    King PieceName = "King"
    Queen PieceName = "Queen"
    Rook0 PieceName = "Rook0"
    Rook1 PieceName = "Rook1"
    Bishop0 PieceName = "Bishop0"
    Bishop1 PieceName = "Bishop1"
    Knight0 PieceName = "Knight0"
    Knight1 PieceName = "Knight1"
    Pawn0 PieceName = "Pawn0"
    Pawn1 PieceName = "Pawn1"
    Pawn2 PieceName = "Pawn2"
    Pawn3 PieceName = "Pawn3"
    Pawn4 PieceName = "Pawn4"
    Pawn5 PieceName = "Pawn5"
    Pawn6 PieceName = "Pawn6"
    Pawn7 PieceName = "Pawn7"
)

const (
    Undefined Color = ""
    White Color = "White"
    Black Color = "Black"
)

const (
    Left AttackBoardType = "Left"
    Right AttackBoardType = "Right"
)

const (
    Top FullBoardType = "Top"
    Middle FullBoardType = "Middle"
    Bottom FullBoardType = "Bottom"
)

type Move struct {
    Piece struct {
        Name PieceName `json:"name"`;
        Color Color `json:"color"`;
    } `json:"piece"`;
    Eaten bool `json:"eaten"`;
    Checkmate bool `json:"checkmate"`;
    AttackBoard *struct {
        AttackBoardType AttackBoardType `json:"attackBoardType"`;
        Color Color `json:"color"`;
        Captured bool `json:"captured"`;
    } `json:"attackBoard,omitempty"`;
    StartCell struct {
        X int `json:"x"`;
        Y int `json:"y"`;
        BoardType FullBoardType `json:"boardType"`;
        AttackBoardColor Color `json:"attackBoardColor"`;
    } `json:"startCell"`;
    EndCell struct {
        X int `json:"x"`;
        Y int `json:"y"`;
        BoardType FullBoardType `json:"boardType"`;
        AttackBoardColor Color `json:"attackBoardColor"`;
    } `json:"endCell"`;
    GameId string `json:"gameId"`;
    PlayerId string `json:"playerId"`;
}

func (move *Move) Print() {
    fmt.Printf("Move: \n");
    fmt.Printf("moved piece: %v; Color: %v\n", move.Piece.Name, move.Piece.Color);
    fmt.Printf("start cell:\n");
    fmt.Printf(
        "x: %d; y: %d; boardType: %v; attackBoardColor: %v\n", 
        move.StartCell.X,
        move.StartCell.Y,
        move.StartCell.BoardType,
        move.StartCell.AttackBoardColor,
    );

    if move.Eaten {
        fmt.Printf("the player ate an opponent's piece at cell:\n");
    } else {
        fmt.Printf("end cell:\n");
    }

    fmt.Printf(
        "x: %d; y: %d; boardType: %v; attackBoardColor: %v\n", 
        move.EndCell.X,
        move.EndCell.Y,
        move.EndCell.BoardType,
        move.EndCell.AttackBoardColor,
    );

    if move.AttackBoard != nil  {
        if move.AttackBoard.Captured {
            fmt.Printf("the player moved his piece on an opponent's attack board:\n");
        } else {
            fmt.Printf("the player moved his piece on one of his attack boards:\n");
        }

        fmt.Printf(
            "attackBoardType: %v; attackBoardColor: %v\n",
            move.AttackBoard.AttackBoardType,
            move.AttackBoard.Color,
        );
    }

    fmt.Printf("playerId: %s\n", move.PlayerId);
    fmt.Printf("gameId: %s\n", move.GameId);
}

