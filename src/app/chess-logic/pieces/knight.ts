import { Color, Cords, FENChar } from "../models";
import { Piece } from "./piece";

export class Knight extends Piece {
    protected _FENChar: FENChar;
    protected _directions: Cords[] = [
        { x: 1, y: 2 },
        { x: 1, y: -2 },
        { x: -1, y: 2 },
        { x: -1, y: -2 },
        { x: 2, y: 1 },
        { x: 2, y: -1 },
        { x: -2, y: 1 },
        { x: -2, y: -1 }
    ];

    constructor(private pieceColor: Color) {
        super(pieceColor);
        this._FENChar = pieceColor === Color.White ? FENChar.KnightWhite : FENChar.KnightBlack;
    }
}