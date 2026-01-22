import { Color, Cords, FENChar } from "../models";
import { Piece } from "./piece";

export class Pawn extends Piece {
    private _hasMoved: boolean = false;
    protected _FENChar: FENChar;
    protected _directions: Cords[] = [
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: -1 }
    ];

    constructor(private pieceColor: Color) {
        super(pieceColor);
        this._FENChar = pieceColor === Color.White ? FENChar.PawnWhite : FENChar.PawnBlack;
        if (this.pieceColor === Color.Black) {
            this.setBlackPawnDirections();
        }
    }

    private setBlackPawnDirections() {
        this._directions = this._directions.map(({x, y}) => ({x: -1*x, y}));
    }

    public get hasMoved(): boolean {
        return this._hasMoved;
    }
    public set hasMoved(_) {
        this._hasMoved = true;
        this._directions = [
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: -1 }
        ];
        if (this.pieceColor === Color.Black) {
            this.setBlackPawnDirections();
        }
    }
}