export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export interface Position {
  x: number;
  y: number;
}

export interface Tetromino {
  shape: number[][];
  type: TetrominoType;
  position: Position;
}

export interface GameState {
  board: (TetrominoType | null)[][];
  currentPiece: Tetromino | null;
  score: number;
  gameOver: boolean;
  level: number;
  lines: number;
}
