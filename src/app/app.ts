import { Component } from '@angular/core';
import { ChessBoardComponent } from './modules/chess-board/chess-board-component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChessBoardComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
   title = 'chessApp';
}
