import { Color, Cords, FENChar, KingCheckStatus, LastMove, SafeSquares } from "./models";
import { Bishop } from "./pieces/bishop";
import { King } from "./pieces/king";
import { Knight } from "./pieces/knight";
import { Pawn } from "./pieces/pawn";
import { Piece } from "./pieces/piece";
import { Queen } from "./pieces/queen";
import { Rook } from "./pieces/rook";
import { FENConverter } from "./FENConverter";

export class ChessBoard {
    // ChessBoard implementation
    private chessBoard: (Piece | null)[][];
    private _playerColor = Color.White;
    private readonly chessBoardSize: number = 8;
    private _safeSquares: SafeSquares;
    private _lastMove: LastMove | undefined;
    private _kingChecked: KingCheckStatus = { isInCheck: false };
    private _isGameOver: boolean = false;
    private _gameOverMsg: string | undefined;
    private fiftyMoveRuleCounter: number = 0;
    private fullNumberOfMoves: number = 1;
    private threeFoldRepetitionMap: Map<string, number> = new Map<string, number>();
    private threeFoldRepetitionFlag: boolean = false;

    private _boardAsFEN: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    private FENConverter = new FENConverter();


    constructor() {
        this.chessBoard = [
            [
                new Rook(Color.White), new Knight(Color.White), new Bishop(Color.White), new Queen(Color.White),
                new King(Color.White), new Bishop(Color.White), new Knight(Color.White), new Rook(Color.White)
            ],
            [
                new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White),
                new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White)
            ],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [
                new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black),
                new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black)
            ],
            [
                new Rook(Color.Black), new Knight(Color.Black), new Bishop(Color.Black), new Queen(Color.Black),
                new King(Color.Black), new Bishop(Color.Black), new Knight(Color.Black), new Rook(Color.Black)
            ]
        ];
        this._safeSquares = this.findSafeSquares();
    }

    public get playerColor(): Color {
        return this._playerColor;
    }
    
    public get chessboardView(): (FENChar | null)[][] {
        return this.chessBoard.map(row => {
            return row.map(piece => piece instanceof Piece ? piece.FENChar : null)
        });
    }

    public get safeSquares(): SafeSquares {
        return this._safeSquares;
    }

    public get lastMove(): LastMove | undefined {
        return this._lastMove;
    }

    public get kingChecked(): KingCheckStatus {
        return this._kingChecked;
    }

    public get isGameOver(): boolean {
        return this._isGameOver;
    }

    public get gameOverMsg(): string | undefined {
        return this._gameOverMsg;
    }

    public get boardAsFEN(): string {
        return this.boardAsFEN;
    }

    public static isSquareLight(x: number, y: number): boolean {
        return x % 2 === 0 && y % 2 === 1 || x % 2 === 1 && y % 2 === 0;
    }

    private isPositionValid(x: number, y: number): boolean {
        return x >= 0 && x < this.chessBoardSize && y >= 0 && y < this.chessBoardSize;
    }


    public isInCheck(playerColor: Color, isPosCurrent: boolean): boolean {
        // Implementation to determine if the player is in check
        for (let x = 0; x < this.chessBoardSize; x++) {
            for (let y = 0; y < this.chessBoardSize; y++) {
                const piece: Piece | null = this.chessBoard[x][y];
                if (!piece || piece.color === playerColor) {
                    continue;
                }
                for (const {x: dx, y: dy} of piece.directions)
                {
                    let newX: number = x + dx;
                    let newY: number = y + dy;

                    if(!this.isPositionValid(newX, newY))
                        {
                            continue;
                        }

                    if (piece instanceof Knight || piece instanceof King || piece instanceof Pawn) {
                        const targetPiece: Piece | null = this.chessBoard[newX][newY];

                        if (piece instanceof Pawn && dy === 0) {
                            continue;
                        }
                        if (targetPiece instanceof King && targetPiece.color === playerColor) {
                            if (isPosCurrent) {
                                this._kingChecked = { isInCheck: true, x: newX, y: newY };
                            }
                            return true;
                        }
                    } 
                    else 
                    {
                        while (this.isPositionValid(newX, newY)) {
                            const targetPiece: Piece | null = this.chessBoard[newX][newY];
                            if (targetPiece instanceof King && targetPiece.color === playerColor) {
                                 if (isPosCurrent) {
                                this._kingChecked = { isInCheck: true, x: newX, y: newY };
                            }
                            return true;
                            }

                            if (targetPiece !== null) {
                                break;
                            }

                            newX += dx;
                            newY += dy;
                        }
                    }
                }
            }
        }
        if (isPosCurrent) { 
            this._kingChecked = { isInCheck: false };
        }
        return false;
    }
    
    private isPositionUnderAttack(prevX: number, prevY: number, newX: number, newY: number): boolean {
        const piece: Piece | null = this.chessBoard[prevX][prevY];
        if (piece === null) {
            return false;
        }
        const newPiece: Piece | null = this.chessBoard[newX][newY];
        if (newPiece && newPiece.color === piece.color) {
            return false; // there is a piece of the same color at the new position
        }

        // Simulate the move
        this.chessBoard[prevX][prevY] = null;
        this.chessBoard[newX][newY] = piece;

        const isPositionSafe = !this.isInCheck(piece.color, false);

        // restore the original positions
        this.chessBoard[prevX][prevY] = piece;
        this.chessBoard[newX][newY] = newPiece;


        return isPositionSafe; // Placeholder for actual attack detection logic
    }

    private findSafeSquares(): SafeSquares {
        const safeSquares: SafeSquares = new Map<string, Cords[]>();

        for (let x = 0; x < this.chessBoardSize; x++) {
            for (let y = 0; y < this.chessBoardSize; y++) {
                const piece: Piece | null = this.chessBoard[x][y];
                if (!piece || piece.color !== this._playerColor) {
                    continue;
                }

                const pieceSafeSquares: Cords[] = [];

                for(const {x: dx, y: dy} of piece.directions)
                {
                    let newX: number = x + dx;
                    let newY: number = y + dy;
                    if(!this.isPositionValid(newX, newY))
                        continue;

                    let newPiece: Piece | null = this.chessBoard[newX][newY];

                    if (newPiece && newPiece.color === piece.color) {
                        continue; // there is a piece of the same color at the new position
                    }   

                    // restricted movement pieces
                    if (piece instanceof Pawn)
                    {
                        // Two-square initial move: ensure path is clear
                        if ((dx === 2 || dx === -2)) {
                            if (newPiece) continue; // can't land on occupied square
                            const betweenX = newX + (dx === 2 ? -1 : 1);
                            if (this.chessBoard[betweenX][newY]) continue; // can't jump over pieces
                        }

                        // Single-square forward move: cannot move into an occupied square
                        if ((dx === 1 || dx === -1) && dy === 0 && newPiece) {
                            continue;
                        }

                        // Diagonal captures: only allowed if there is an opponent piece
                        if ((dy === 1 || dy === -1) && (!newPiece || piece.color === newPiece?.color)) {
                            continue;
                        }
                    }

                    if (piece instanceof Pawn || piece instanceof Knight || piece instanceof King) {
                        if (this.isPositionUnderAttack(x, y, newX, newY)) {
                            pieceSafeSquares.push({x: newX, y: newY});
                        }
                    }
                    else
                    {
                        while(this.isPositionValid(newX, newY)) {
                            newPiece = this.chessBoard[newX][newY];

                            if (newPiece && newPiece.color === piece.color) {
                                break; // there is a piece of the same color at the new position
                            }
                            if (this.isPositionUnderAttack(x, y, newX, newY)) {
                            pieceSafeSquares.push({x: newX, y: newY});
                            }
                            if (newPiece !== null) {
                                break; // cannot move past other pieces
                            }   

                            newX += dx;
                            newY += dy;
                        }
                    }
                }

                if (piece instanceof King) {
                    // Castling moves
                    if (this.canCastle(piece, true)) {
                        pieceSafeSquares.push({x, y:6});
                    }
                    if (this.canCastle(piece, false)) {
                        pieceSafeSquares.push({x, y:2});
                    }
                }
                else if (piece instanceof Pawn && this.canEnPassant(piece, x, y)) {
                    // En Passant moves
                    pieceSafeSquares.push({x: x + (piece.color === Color.White ? 1 : -1), y: this._lastMove!.prevY});
                } 

                if (pieceSafeSquares.length > 0) {
                    safeSquares.set(x + "," + y, pieceSafeSquares);
                }
            }
            
        }
       /* console.log('findSafeSquares: found', safeSquares.size, 'pieces with safe moves');
        if (safeSquares.size > 0) {
            console.log('safeSquares keys:', Array.from(safeSquares.keys()));
        }
            */
        return safeSquares;
    }


    public canCastle(king: King, kingSideCastle: boolean): boolean {
        if (king.hasMoved) {
            return false;
        }
        const kingPosX: number = king.color === Color.White ? 0 : 7;
        const kingPosY: number = 4;
        const rookPosX: number = kingPosX;
        const rookPosY: number = kingSideCastle ? 7 : 0;
        const rook: Piece | null = this.chessBoard[rookPosX][rookPosY];
        if (!(rook instanceof Rook) || rook.hasMoved || this._kingChecked.isInCheck) {
            return false;
        }

        const firstNextKingPosY: number = kingPosY + (kingSideCastle ? 1 : -1);
        const secondNextKingPosY: number = kingPosY + (kingSideCastle ? 2 : -2);

        if (this.chessBoard[kingPosX][firstNextKingPosY] || this.chessBoard[kingPosX][secondNextKingPosY]) {
            return false;
        }

        if (!kingSideCastle && this.chessBoard[kingPosX][1]) {
            return false;
        }

        return !this.isPositionUnderAttack(kingPosX, kingPosY, kingPosX, firstNextKingPosY) === false &&
               !this.isPositionUnderAttack(kingPosX, kingPosY, kingPosX, secondNextKingPosY) === false;

    }

    public canEnPassant(pawn: Pawn, pawnX: number, pawnY: number): boolean {
        if (!this._lastMove) {
            return false;
        }
        const {piece, prevX, prevY, curX, curY} = this._lastMove;

        if (!(piece instanceof Pawn) || piece.color === pawn.color || Math.abs(curX - prevX) !== 2 || pawnX !== curX || Math.abs(pawnY - curY) !== 1)
        {
            return false;
        }

        const pawnNextPosX: number = pawnX + (pawn.color === Color.White ? 1 : -1);
        const pawnNewPosY: number = curY;

        this.chessBoard[curX][curY] = null;
        const isPositionSafe = !this.isInCheck(pawn.color, false);
        const isPosSafe: boolean = this.isPositionUnderAttack(pawnX, pawnY, pawnNextPosX, pawnNewPosY);

        this.chessBoard[curX][curY] = piece;

        return isPosSafe;
    }

    public move(prevX: number, prevY: number, newX: number, newY: number, promotedPieceType: FENChar|null): void {
        if (this._isGameOver) {
           throw new Error("Game is over. No more moves allowed.");
        }
        if (!this.isPositionValid(prevX, prevY) || !this.isPositionValid(newX, newY)) 
        {
            return;
        }
        const piece: Piece | null = this.chessBoard[prevX][prevY];
        if (!piece || piece.color !== this._playerColor) return;

        const pieceSafeSquares: Cords[] | undefined = this._safeSquares.get(prevX + "," + prevY);
        if (!pieceSafeSquares || !pieceSafeSquares.find(cords => cords.x === newX && cords.y === newY))
        {
            throw new Error("Invalid move");
        }

        if ((piece instanceof Pawn || piece instanceof Rook || piece instanceof King) && !piece.hasMoved) {
            piece.hasMoved = true;
        }

        const isPieceTaken: boolean = this.chessBoard[newX][newY] !== null;
        if (piece instanceof Pawn || isPieceTaken) {
            this.fiftyMoveRuleCounter = 0;
        }
        else
        {
            this.fiftyMoveRuleCounter++;
        }

        this.handlingSpecialMoves(piece, prevX, prevY, newX, newY);
        // update the board
        const pieceToPlace: Piece = promotedPieceType ? this.promotePawn(promotedPieceType) : piece;

        this.chessBoard[newX][newY] = pieceToPlace;
        this.chessBoard[prevX][prevY] = null;
        this._lastMove = {
            piece: pieceToPlace,
            prevX: prevX,
            prevY: prevY,
            curX: newX,
            curY: newY
        };
        this._playerColor = this._playerColor === Color.White ? Color.Black : Color.White;
        this.isInCheck(this._playerColor, true);
        this._safeSquares = this.findSafeSquares();
        if (this._playerColor === Color.White)
        {
            this.fullNumberOfMoves++;
        }
        this._isGameOver = this.isGameFinished();

        
        //console.log(this.playerColor);
        console.log(this._kingChecked.isInCheck);
    }

    private handlingSpecialMoves(piece: Piece, prevX: number, prevY: number, newX: number, newY: number): void {
        // Handle castling
        if (piece instanceof King && Math.abs(newY - prevY) === 2) {
            // newY > prevY === King side castle
            const rookPosX: number = prevX;
            const rookPosY: number = newY > prevY ? 7 : 0;
            const rook = this.chessBoard[rookPosX][rookPosY] as Rook;
            const rookNewPosY: number = newY > prevY ? 5 : 3;

            // move the rook

            this.chessBoard[rookPosX][rookPosY] = null;
            this.chessBoard[rookPosX][rookNewPosY] = rook;
            rook.hasMoved = true;
        }
        else if (piece instanceof Pawn && this._lastMove && this._lastMove.piece instanceof Pawn && Math.abs(this._lastMove.curX - this._lastMove.prevX) === 2 && prevX === this._lastMove.curX && newY === this._lastMove.curY) {
            this.chessBoard[this._lastMove.curX][this._lastMove.curY] = null;
        }
    }

    private promotePawn(promotedPieceType: FENChar): Knight|Bishop|Rook|Queen {
        if (promotedPieceType === FENChar.QueenWhite || promotedPieceType === FENChar.QueenBlack) {
            return new Queen(this._playerColor);
        }
        else if (promotedPieceType === FENChar.RookWhite || promotedPieceType === FENChar.RookBlack) {
            return new Rook(this._playerColor);
        }
        else if (promotedPieceType === FENChar.BishopWhite || promotedPieceType === FENChar.BishopBlack) {
            return new Bishop(this._playerColor);
        }
        return new Knight(this._playerColor);   
    } 

    // set a piece at a specific position
    public setPieceAt(x: number, y: number, fenChar: FENChar | null): void {
        if (!this.isPositionValid(x, y)) {
            throw new Error("Invalid position");
        }

        if (fenChar === null) {
            this.chessBoard[x][y] = null;
        } else {
            let piece: Piece;
            switch (fenChar) {
                case FENChar.PawnWhite: piece = new Pawn(Color.White); break;
                case FENChar.RookWhite: piece = new Rook(Color.White); break;
                case FENChar.KnightWhite: piece = new Knight(Color.White); break;
                case FENChar.BishopWhite: piece = new Bishop(Color.White); break;
                case FENChar.QueenWhite: piece = new Queen(Color.White); break;
                case FENChar.PawnBlack: piece = new Pawn(Color.Black); break;
                case FENChar.RookBlack: piece = new Rook(Color.Black); break;
                case FENChar.KnightBlack: piece = new Knight(Color.Black); break;
                case FENChar.BishopBlack: piece = new Bishop(Color.Black); break;
                case FENChar.QueenBlack: piece = new Queen(Color.Black); break;
                default:
                    throw new Error("Unsupported FENChar");
            }
            this.chessBoard[x][y] = piece;
        }

        // Clear last move since board was modified externally
        this._lastMove = undefined;

        // Update king-check status (check white first, then black)
        if (this.isInCheck(Color.White, true)) {
            // _kingChecked set in isInCheck
        } else if (this.isInCheck(Color.Black, true)) {
            // _kingChecked set in isInCheck
        } else {
            this._kingChecked = { isInCheck: false };
        }

        // Recalculate safe squares and game-over state
        this._safeSquares = this.findSafeSquares();
        this._isGameOver = this.isGameFinished();
    }

    // remove a piece from a specific position
    public removePieceAt(x: number, y: number): void {
        if (!this.isPositionValid(x, y)) {
            throw new Error("Invalid position");
        }
        this.chessBoard[x][y] = null;
    }

    //move a piece from one position to another (admin/manual move that bypasses normal move validation)
    public movePiece(prevX: number, prevY: number, newX: number, newY: number): void {
        if (!this.isPositionValid(prevX, prevY) || !this.isPositionValid(newX, newY)) {
            throw new Error("Invalid position");
        }

        const piece: Piece | null = this.chessBoard[prevX][prevY];
        if (!piece) {
            throw new Error("No piece at source position");
        }

        const isPieceTaken: boolean = this.chessBoard[newX][newY] !== null;
        if (piece instanceof Pawn || isPieceTaken) {
            this.fiftyMoveRuleCounter = 0;
        } else {
            this.fiftyMoveRuleCounter++;
        }

        // Move the piece
        this.chessBoard[newX][newY] = piece;
        this.chessBoard[prevX][prevY] = null;

        // Update last move and switch player to mirror standard moves
        this._lastMove = {
            piece: piece,
            prevX: prevX,
            prevY: prevY,
            curX: newX,
            curY: newY
        };

        this._playerColor = this._playerColor === Color.White ? Color.Black : Color.White;

        // Recalculate checks, safe squares and game state
        this.isInCheck(this._playerColor, true);
        this._safeSquares = this.findSafeSquares();
        this._isGameOver = this.isGameFinished();
    }

    private isGameFinished(): boolean {
        //insufficient material check
        if (this.insufficientMaterial()) {
            this._gameOverMsg = "Draw due to insufficient material.";
            return true;
        }
        // Implementation to determine if the game is over (checkmate or stalemate)
        if (!this._safeSquares.size) {
            if (this._kingChecked.isInCheck) {
                const prevPlayer: string = this._playerColor === Color.White ? "Black" : "White";
                this._gameOverMsg = `Checkmate! ${prevPlayer} wins.`;
                console.log(this.playerColor);
                console.log(prevPlayer);
            } else {
                this._gameOverMsg = "Stalemate! It's a draw.";
            }
            return true;
    
        }

        if (this.threeFoldRepetitionFlag) {
            this._gameOverMsg = "Draw by threefold repetition.";
            return true;
        }

        if (this.fiftyMoveRuleCounter >= 100) { // because counts for both players
            this._gameOverMsg = "Draw by fifty-move rule.";
            return true;
        }
        return false;
    }

     // Insufficient material

    private playerHasOnlyTwoKnightsAndKing(pieces: { piece: Piece, x: number, y: number }[]): boolean {
        return pieces.filter(piece => piece.piece instanceof Knight).length === 2;
    }

    private playerHasOnlyBishopsWithSameColorAndKing(pieces: { piece: Piece, x: number, y: number }[]): boolean {
        const bishops = pieces.filter(piece => piece.piece instanceof Bishop);
        const areAllBishopsOfSameColor = new Set(bishops.map(bishop => ChessBoard.isSquareLight(bishop.x, bishop.y))).size === 1;
        return bishops.length === pieces.length - 1 && areAllBishopsOfSameColor;
    }

    private insufficientMaterial(): boolean {
        const whitePieces: { piece: Piece, x: number, y: number }[] = [];
        const blackPieces: { piece: Piece, x: number, y: number }[] = [];

        for (let x = 0; x < this.chessBoardSize; x++) {
            for (let y = 0; y < this.chessBoardSize; y++) {
                const piece: Piece | null = this.chessBoard[x][y];
                if (!piece) continue;

                if (piece.color === Color.White) whitePieces.push({ piece, x, y });
                else blackPieces.push({ piece, x, y });
            }
        }

        // King vs King
        if (whitePieces.length === 1 && blackPieces.length === 1)
            return true;

        // King and Minor Piece vs King
        if (whitePieces.length === 1 && blackPieces.length === 2)
            return blackPieces.some(piece => piece.piece instanceof Knight || piece.piece instanceof Bishop);

        else if (whitePieces.length === 2 && blackPieces.length === 1)
            return whitePieces.some(piece => piece.piece instanceof Knight || piece.piece instanceof Bishop);

        // both sides have bishop of same color
        else if (whitePieces.length === 2 && blackPieces.length === 2) {
            const whiteBishop = whitePieces.find(piece => piece.piece instanceof Bishop);
            const blackBishop = blackPieces.find(piece => piece.piece instanceof Bishop);

            if (whiteBishop && blackBishop) {
                const areBishopsOfSameColor: boolean = ChessBoard.isSquareLight(whiteBishop.x, whiteBishop.y) && ChessBoard.isSquareLight(blackBishop.x, blackBishop.y) || !ChessBoard.isSquareLight(whiteBishop.x, whiteBishop.y) && !ChessBoard.isSquareLight(blackBishop.x, blackBishop.y);

                return areBishopsOfSameColor;
            }
        }

        if (whitePieces.length === 3 && blackPieces.length === 1 && this.playerHasOnlyTwoKnightsAndKing(whitePieces) ||
            whitePieces.length === 1 && blackPieces.length === 3 && this.playerHasOnlyTwoKnightsAndKing(blackPieces)
        ) return true;

        if (whitePieces.length >= 3 && blackPieces.length === 1 && this.playerHasOnlyBishopsWithSameColorAndKing(whitePieces) ||
            whitePieces.length === 1 && blackPieces.length >= 3 && this.playerHasOnlyBishopsWithSameColorAndKing(blackPieces)
        ) return true;

        return false;
    }

    private updateThreeFoldRepetition(FEN: string): void {
    
    const threeFoldRepetitionFENKey: string = FEN.split(" ").slice(0, 4).join("");
    const threeFoldRepetitionValue: number | undefined = this.threeFoldRepetitionMap.get(threeFoldRepetitionFENKey);

    if (threeFoldRepetitionValue === undefined) {
        this.threeFoldRepetitionMap.set(threeFoldRepetitionFENKey, 1);
        } else {
            if (threeFoldRepetitionValue === 2)
            {
                this.threeFoldRepetitionFlag = true;
                return;
            }
            this.threeFoldRepetitionMap.set(threeFoldRepetitionFENKey, 2);
        }
    
    }
}