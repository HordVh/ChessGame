import { Color, Cords, FENChar } from "../models";

export abstract class Piece {
    protected abstract _FENChar: FENChar;
    protected abstract _directions: Cords[];

    constructor(private _color: Color){}

    public get FENChar(): FENChar {
        return this._FENChar;
    }

    public get directions(): Cords[] {
        return this._directions;
    }

    public get color(): Color {
        return this._color;
    }
    
}