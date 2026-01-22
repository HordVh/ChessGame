import { Color, Cords, FENChar } from "../models";
import { Piece } from "./piece";

export class King extends Piece {
    private _hasMoved: boolean = false;
    protected _FENChar: FENChar;
    protected _directions: Cords[] = [
        { x: 0, y: 1 },
        { x: 0, y: -1 },
        { x: 1, y: 0},
        { x: 1, y: -1 },
        { x: 1, y: 1 },
        { x: -1, y: 0 },
        { x: -1, y: 1 },
        { x: -1, y: -1 },
    ];

    constructor(private pieceColor: Color) {
        super(pieceColor);
        this._FENChar = pieceColor === Color.White ? FENChar.KingWhite : FENChar.KingBlack;
    }

    public get hasMoved(): boolean {
        return this._hasMoved;
    }

    public set hasMoved(_) {
        this._hasMoved = true;
    }
}