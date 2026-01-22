import { Piece } from "./pieces/piece";

export enum Color {
    White,
    Black
}

export type Cords = {
    x: number;
    y: number;
}

export enum FENChar {
    PawnWhite = 'P',
    RookWhite = 'R',
    KnightWhite = 'N',
    BishopWhite = 'B',
    QueenWhite = 'Q',
    KingWhite = 'K',
    PawnBlack = 'p',
    RookBlack = 'r',
    KnightBlack = 'n',
    BishopBlack = 'b',
    QueenBlack = 'q',
    KingBlack = 'k'
}

export const pieceImagePaths: Readonly<Record<FENChar, string>> = {
    [FENChar.PawnWhite]: "Pieces/pawnw.svg",
    [FENChar.RookWhite]: "Pieces/rookw.svg",
    [FENChar.KnightWhite]: "Pieces/knightw.svg",
    [FENChar.BishopWhite]: "Pieces/bishopw.svg",
    [FENChar.QueenWhite]: "Pieces/queenw.svg",
    [FENChar.KingWhite]: "Pieces/kingw.svg",
    [FENChar.PawnBlack]: "Pieces/pawnb.svg",
    [FENChar.RookBlack]: "Pieces/rookb.svg",
    [FENChar.KnightBlack]: "Pieces/knightb.svg",
    [FENChar.BishopBlack]: "Pieces/bishopb.svg",
    [FENChar.QueenBlack]: "Pieces/queenb.svg",
    [FENChar.KingBlack]: "Pieces/kingb.svg"
}

export type SafeSquares = Map<string, Cords[]>;

export type LastMove = {
    piece: Piece;
    prevX: number;
    prevY: number;
    curX: number;
    curY: number;

};

type KingChecked = {
    isInCheck: true;
    x: number;
    y: number;
}

type KingNotChecked = {
    isInCheck: false;
}

export type KingCheckStatus = KingChecked | KingNotChecked;

export const columns = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;