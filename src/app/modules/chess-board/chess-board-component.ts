import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Color, Cords, FENChar, KingCheckStatus, LastMove, pieceImagePaths, SafeSquares } from '../../chess-logic/models';
import { ChessBoard, ChessBoard as ChessBoardModel } from '../../chess-logic/chess-board';
import { SelectedSquare } from './models';
import { Pawn } from '../../chess-logic/pieces/pawn';

@Component({
  selector: 'app-chess-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chess-board.html',
  styleUrls: ['./chess-board.css'],
})
export class ChessBoardComponent {
  public pieceImagePaths = pieceImagePaths;

  private chessboard = new ChessBoardModel();
  public chessboardView: (FENChar | null)[][] = this.chessboard.chessboardView;
  public get playerColor(): Color {
    return this.chessboard.playerColor;
  }
  public get safeSquares(): SafeSquares {
    return this.chessboard.safeSquares;
  };

  public get gameOverMsg(): string | undefined {
    return this.chessboard.gameOverMsg;
  }

/*
  constructor() {
    console.log('ChessBoardComponent initialized');
    console.log('Piece Image Paths:', this.pieceImagePaths);
    console.log('ChessboardView:', this.chessboardView);
  }
    */

  private selectedSquare: SelectedSquare = { piece: null };
  private pieceSafeSquares: Cords[] = [];
  private lastMove: LastMove | undefined = this.chessboard.lastMove;
  private kingChecked: KingCheckStatus = this.chessboard.kingChecked;
  
  // admin panel
  private isAdminPanelVisible: boolean = false;
  adminForm = { x: 0, y: 0, fen: FENChar.QueenBlack as FENChar };
  errorMsg: string | null = null;

  // Add-menu state: isAddMenuVisible opens the piece selector, isPlacingNewPiece means a piece was chosen and next board click will place it
  public isAddMenuVisible: boolean = false;
  public isPlacingNewPiece: boolean = false;
  public isMovingAPiece: boolean = false;
  public isMovingMenuVisible: boolean = false;

  // list of all pieces (white then black) for the add menu *except kings
  public addPieces: FENChar[] = [
    FENChar.PawnWhite, FENChar.RookWhite, FENChar.KnightWhite, FENChar.BishopWhite, FENChar.QueenWhite,
    FENChar.PawnBlack, FENChar.RookBlack, FENChar.KnightBlack, FENChar.BishopBlack, FENChar.QueenBlack
  ];

  public toggleAdminPanel(): void {
    this.isAdminPanelVisible = !this.isAdminPanelVisible;
    this.errorMsg = null;
  }

  public closeAdminPanel(): void {
    this.isAdminPanelVisible = false;
    this.errorMsg = null;
  }

  public setAdminPiece(): void {
    if (this.adminForm.x < 0 || this.adminForm.x > 7 || this.adminForm.y < 0 || this.adminForm.y > 7) {
      this.errorMsg = "Coordinates must be between 0 and 7.";
      return;
    }

    this.chessboard.setPieceAt(this.adminForm.x, this.adminForm.y, this.adminForm.fen);
    this.chessboardView = this.chessboard.chessboardView;
    this.errorMsg = null;

  }

  public moveAdminPiece(): void {
    if (this.adminForm.x < 0 || this.adminForm.x > 7 || this.adminForm.y < 0 || this.adminForm.y > 7) {
      this.errorMsg = "Coordinates must be between 0 and 7.";
      return;
    }
    const pieceAtAdminPos = this.chessboardView[this.adminForm.x][this.adminForm.y];
    if (!pieceAtAdminPos) {
      this.errorMsg = "No piece at the specified coordinates to move.";
      return;
    }
    

  }

  // toggle the add-menu visibility
  public toggleAddMenu(): void {
    this.isAddMenuVisible = !this.isAddMenuVisible;
    if (this.isAddMenuVisible) {
      // entering add-menu mode -> cancel any pending placement
      this.isPlacingNewPiece = false;
      this.isRemovingPiece = false;
      this.errorMsg = null;
    }
  }

  // select a piece from the add menu; next click on board will place it
  public selectAddPiece(piece: FENChar): void {
    this.adminForm.fen = piece;
    this.isAddMenuVisible = true;
    this.isPlacingNewPiece = true;
    this.errorMsg = `Selected ${piece}. Click a square to place it.`;
  }

  // Remove-menu state: isRemoveMenuVisible opens the selector, isRemovingPiece means a piece was chosen and next board click will attempt to remove it
  public isRemoveMenuVisible: boolean = false;
  public isRemovingPiece: boolean = false;

  // toggle the remove-menu visibility
  public toggleRemoveMenu(): void {
    this.isRemoveMenuVisible = !this.isRemoveMenuVisible;
    if (this.isRemoveMenuVisible) {
      // entering remove-menu mode -> cancel any pending add placement
      this.isRemovingPiece = false;
      this.isPlacingNewPiece = false;
      this.errorMsg = null;
    }
  }

  // toggle the move-menu visibility (enter free-move mode)
  public toggleMoveMenu(): void {
    this.isMovingMenuVisible = !this.isMovingMenuVisible;
    if (this.isMovingMenuVisible) {
      // entering free-move mode: allow selecting any piece on the board and moving it
      this.isMovingAPiece = true;
      this.isPlacingNewPiece = false;
      this.isRemovingPiece = false;
      this.selectedSquare = { piece: null };
      this.errorMsg = 'Move mode: click a piece to select source.';
    } else {
      // leaving move mode
      this.isMovingAPiece = false;
      this.selectedSquare = { piece: null };
      this.errorMsg = null;
    }
  }

  // select a piece from the remove menu; next click on board will remove that piece type on matching square
  public selectRemovePiece(piece: FENChar): void {
    this.adminForm.fen = piece;
    this.isRemoveMenuVisible = true;
    this.isRemovingPiece = true;
    this.errorMsg = `Selected ${piece} for removal. Click the matching piece to remove it.`;
  }

  // move a piece
  public selectMovePiece(piece: FENChar): void {
    this.adminForm.fen = piece;
    this.isMovingAPiece = true;
    this.isMovingMenuVisible = true;
    this.errorMsg = `Selected ${piece} to move. Click the piece to select it.`;
  }

  // promotion

  public isPromotionVisible: boolean = false;
  private promotionCoords: Cords | null = null;
  private promotedPiece:FENChar | null = null;
  public promotionPiece(): FENChar[] {
    return this.playerColor === Color.White ?
      [FENChar.QueenWhite, FENChar.RookWhite, FENChar.BishopWhite, FENChar.KnightWhite] :
      [FENChar.QueenBlack, FENChar.RookBlack, FENChar.BishopBlack, FENChar.KnightBlack];
  }

  public isSquareLight(x: number, y: number): boolean {
    return ChessBoard.isSquareLight(x, y);
  }


  public isSquareSafeforSelectedPiece(x: number, y: number): boolean {
    return this.pieceSafeSquares.some(cord => cord.x === x && cord.y === y);
  }

  public isSquareLastMoved(x: number, y: number): boolean {
    if (!this.lastMove) {
      return false;
    }
    // Only highlight the current square (destination) as the last move, not the origin
    const { curX, curY } = this.lastMove;
    return x === curX && y === curY;

  }

  public isSqaureChecked(x: number, y: number): boolean
  {
    return this.kingChecked.isInCheck && this.kingChecked.x === x && this.kingChecked.y === y;
  }

  public isSquarePromSafe(x: number, y: number): boolean
  {
    if (!this.isPromotionVisible || this.promotionCoords === null)
    {
      return false;
    }
    return this.promotionCoords.x === x && this.promotionCoords.y === y;
  }

  private umarkingPrevSelectedSafeSquare(): void
  {
    this.selectedSquare = { piece: null };
    this.pieceSafeSquares = [];
    // Keep the board in view after a move to prevent browser auto-scrolling (first-move jump)
    if (typeof document !== 'undefined') {
      const boardEl = document.querySelector('.chess-board');
      if (boardEl) {
        setTimeout(() => boardEl.scrollIntoView({ block: 'nearest' }), 0);
      }
    }

    if(this.isPromotionVisible)
    {
      this.isPromotionVisible = false;
      this.promotionCoords = null;
      this.promotedPiece = null;
    }
  }

  public isSquareSelected(x: number, y: number): boolean
  {
    if (!this.selectedSquare.piece)
    {
      return false;
    }
    return this.selectedSquare.x === x && this.selectedSquare.y === y;
  }



  public selectingPiece(x: number, y: number): void {
    if (this.gameOverMsg !== undefined)
    {
      return;
    }
    const piece: FENChar | null = this.chessboardView[x][y];
    if (!piece) return;
    const reslecting: boolean= !!this.selectedSquare.piece && this.selectedSquare.x === x && this.selectedSquare.y === y;
    if(reslecting)
    {
      this.umarkingPrevSelectedSafeSquare();
      return;
    }
    if (this.isPieceWrong(piece))
    {
      return;
    }

    //console.log('selectingPiece', { x, y, piece, playerColor: this.playerColor });
    this.selectedSquare = {piece, x, y};
    this.pieceSafeSquares = this.safeSquares.get(x + "," + y) || [];
    //console.log('pieceSafeSquares:', this.pieceSafeSquares);
  }

  private placingPiece(newX: number, newY: number): void
  {
    if (!this.selectedSquare.piece) return;
    if (!this.isSquareSafeforSelectedPiece(newX, newY)) return;

    // pawn promotion 
    const isPawnSeleceted: boolean = this.selectedSquare.piece === FENChar.PawnWhite || this.selectedSquare.piece === FENChar.PawnBlack;
    const isPawnOnLastRank: boolean = isPawnSeleceted && (newX === 7 || newX === 0);
    const openPromDialog: boolean = !this.isPromotionVisible && isPawnOnLastRank;

    if (openPromDialog)
    {
      this.pieceSafeSquares = [];
      this.isPromotionVisible = true;
      this.promotionCoords = {x: newX, y: newY};
      // wait to choose the piece to promote to
      return;
    }


    const {x: prevX, y: prevY} = this.selectedSquare;
   // console.log('placingPiece', { prevX, prevY, newX, newY });
    
    this.updateBoard(prevX, prevY, newX, newY);
  }

  private updateBoard(prevX: number, prevY: number, newX: number, newY: number): void
  {
    this.chessboard.move(prevX, prevY, newX, newY, this.promotedPiece);
    this.chessboardView = this.chessboard.chessboardView;
    // clear selection after move
    this.kingChecked = this.chessboard.kingChecked;
    this.lastMove = this.chessboard.lastMove;
    
    this.umarkingPrevSelectedSafeSquare();
  }

  public promotePiece(piece:FENChar): void {
    if (this.promotionCoords === null || this.selectedSquare.piece === null) {
      return;
    }
    console.log('promotePiece called', { piece, selected: this.selectedSquare, coords: this.promotionCoords });

    this.promotedPiece = piece;
    const {x: newX, y: newY} = this.promotionCoords;
    const {x: prevX, y: prevY} = this.selectedSquare;
    this.updateBoard(prevX, prevY, newX, newY);
  }
  

  public closePawnPromotion(): void {
    this.umarkingPrevSelectedSafeSquare();
  }

  public move(x: number, y: number): void {
    // If a piece was selected from the Add menu, place it on the clicked square
    if (this.isPlacingNewPiece) {
      this.chessboard.setPieceAt(x, y, this.adminForm.fen);
      this.chessboardView = this.chessboard.chessboardView;
      this.isPlacingNewPiece = false;
      this.errorMsg = null;
      return;
    }

    // If a piece type was selected from the Remove menu, attempt to remove matching piece at clicked square
    if (this.isRemovingPiece) {
      const targetPiece = this.chessboardView[x][y];
      if (!targetPiece) {
        this.errorMsg = 'No piece at that square to remove.';
        return;
      }
      if (targetPiece !== this.adminForm.fen) {
        this.errorMsg = `Piece at square (${x},${y}) is ${targetPiece}; expected ${this.adminForm.fen}.`;
        return;
      }

      // Remove the piece
      this.chessboard.setPieceAt(x, y, null);
      this.chessboardView = this.chessboard.chessboardView;
      this.isRemovingPiece = false;
      this.errorMsg = null;
      return;
    }

    // if in free-move mode, perform two-click source->destination move ignoring piece type
    if (this.isMovingAPiece) {
      const currentPiece = this.chessboardView[x][y];

      // First click: select source piece
      if (!this.selectedSquare.piece) {
        if (!currentPiece) {
          this.errorMsg = 'No piece at that square to move.';
          return;
        }
        this.selectedSquare = { x, y, piece: currentPiece };
        this.errorMsg = `Selected source (${x},${y}). Click destination square to move it.`;
        return;
      }

      // Second click: destination
      const prevX = this.selectedSquare.x;
      const prevY = this.selectedSquare.y;

      try {
        this.chessboard.movePiece(prevX, prevY, x, y);
        this.chessboardView = this.chessboard.chessboardView;
        this.errorMsg = null;
      } catch (e) {
        this.errorMsg = e instanceof Error ? e.message : 'Move failed';
      }

      // reset move-mode state
      this.isMovingAPiece = false;
      this.isMovingMenuVisible = false;
      this.selectedSquare = { piece: null };
      this.umarkingPrevSelectedSafeSquare();
      return;
    }

    this.selectingPiece(x, y);
    this.placingPiece(x, y);
  }



  private isPieceWrong(piece: FENChar): boolean 
  {
    const isWhitePiece: boolean = piece === piece.toUpperCase();
    return isWhitePiece && this.playerColor === Color.Black || !isWhitePiece && this.playerColor === Color.White;

  }
  
  public promotionDialogStyle(): { [key: string]: string } {
    if (!this.promotionCoords) return { display: 'none' };
    const squareSize = 60; // matches .square width/height
    // board uses column-reverse, so compute top accordingly
    const left = this.promotionCoords.y * squareSize;
    const top = (7 - this.promotionCoords.x) * squareSize;
    return {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      'z-index': '300'
    };
  }

}
export { ChessBoard };

