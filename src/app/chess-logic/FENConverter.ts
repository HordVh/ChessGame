import { Color, columns, FENChar, LastMove } from "./models";
import { King } from "./pieces/king";
import { Pawn } from "./pieces/pawn";
import { Piece } from "./pieces/piece";
import { Rook } from "./pieces/rook";


export class FENConverter {
    // FEN conversion logic here

    public convertToFEN(
        board: (Piece | null)[][],
        playerColor: Color,
        lastMove: LastMove | undefined,
        fiftyMoveCounter: number,
        fullMoveNumber: number
    ): string {
        // Implementation of FEN conversion
        let FEN: string = "";

        for(let i = 7; i >= 0; i--) {
            let FENRow: string = "";
            let consecutiveEmpty: number = 0;

            for(const piece of board[i]) {
                if(piece === null) {
                    consecutiveEmpty++;
                    continue;
                }
                if(consecutiveEmpty !== 0) {
                    FENRow += consecutiveEmpty.toString();
                    consecutiveEmpty = 0;
                    FENRow += piece.FENChar;
                }
            }
            if(consecutiveEmpty !== 0) {
                FENRow += consecutiveEmpty.toString();
            }
            FEN += (i === 0) ? FENRow : FENRow + "/";
        }
        const player: string = playerColor === Color.White ? "w" : "b";
        FEN += " " + player;
        FEN += " " + this.castlingRights(board);
        FEN += " " + this.enPassantPosibility(lastMove, playerColor);
        FEN += " " + fiftyMoveCounter.toString();
        FEN += " " + fullMoveNumber.toString();

        return FEN;
    }

    private castlingRights(board: (Piece | null)[][]): string {
        const castlingPossibilities = (color: Color): string =>
        {
            let castlingAvailable: string = "";
            const kingPos: number = color === Color.White ? 0 : 7;
            const king: Piece | null = board[kingPos][4];
            if (king instanceof King && !king.hasMoved) {
                const rookPosX: number = kingPos;
                const rookKingside = board[rookPosX][7];
                const rookQueenside = board[rookPosX][0];

                if (rookKingside instanceof Rook && !rookKingside.hasMoved)
                {
                    castlingAvailable += "k";
                }
                if (rookQueenside instanceof Rook && !rookQueenside.hasMoved)
                {
                    castlingAvailable += "q";
                }
                if (color === Color.White) {
                    castlingAvailable = castlingAvailable.toUpperCase();
                }
            }
            return castlingAvailable;
        }
        const castlingAvailable: string = castlingPossibilities(Color.White) + castlingPossibilities(Color.Black);
        return castlingAvailable !== "" ? castlingAvailable : "-";

    }

    private enPassantPosibility(lastMove: LastMove | undefined, color: Color): string{
        if(!lastMove) return "-";
        const { piece, curX: newX, prevX, prevY } = lastMove;

        if(piece instanceof Pawn && Math.abs(newX - prevX) === 2)
        {
            const row: number = color === Color.White ? 6 : 3;
            return columns[prevY] + row.toString();
        }
        return "-";
    }
}