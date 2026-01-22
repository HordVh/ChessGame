import e from "express";
import { Color, Cords, FENChar } from "../models";
import { Piece } from "./piece";

export class Bishop extends Piece {
    protected _FENChar: FENChar;
    protected _directions: Cords[] = [
        { x: 1, y: 1 },
        { x: 1, y: -1 },
        { x: -1, y: 1 },
        { x: -1, y: -1 }
    ];

    constructor(private pieceColor: Color) {
        super(pieceColor);
        this._FENChar = pieceColor === Color.White ? FENChar.BishopWhite : FENChar.BishopBlack;
    }
}