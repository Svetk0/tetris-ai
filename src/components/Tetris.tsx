"use client";

import { useEffect, useState, useCallback } from "react";
import { GameState, Tetromino, TetrominoType } from "@/types/tetris";
import styles from "./Tetris.module.scss";
import GameHelper from "./GameHelper";
import BubbleExplosion from "./BubbleExplosion";
import NextPiece from "./NextPiece";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const LEVEL_REQUIREMENTS = [
  { level: 1, score: 0 },
  { level: 2, score: 200 },
  { level: 3, score: 400 },
  { level: 4, score: 600 },
  { level: 5, score: 800 },
  { level: 6, score: 1200 },
  { level: 7, score: 1600 },
  { level: 8, score: 2000 },
  { level: 9, score: 2400 },
  { level: 10, score: 3600 },
];

const TETROMINOES = {
  I: {
    shape: [[1, 1, 1, 1]],
    type: "I" as TetrominoType,
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    type: "O" as TetrominoType,
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    type: "T" as TetrominoType,
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    type: "S" as TetrominoType,
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    type: "Z" as TetrominoType,
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    type: "J" as TetrominoType,
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    type: "L" as TetrominoType,
  },
};

interface ExplosionAnimation {
  id: number;
  x: number;
  y: number;
}

const Tetris = () => {
  const createNewPiece = useCallback((): Tetromino => {
    const types = Object.keys(TETROMINOES) as TetrominoType[];
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      ...TETROMINOES[type],
      position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
    };
  }, []);

  const [gameState, setGameState] = useState<GameState>({
    board: Array(BOARD_HEIGHT)
      .fill(null)
      .map(() => Array(BOARD_WIDTH).fill(null)),
    currentPiece: null,
    score: 0,
    gameOver: false,
    level: 1,
    lines: 0,
  });

  const [explosions, setExplosions] = useState<ExplosionAnimation[]>([]);
  const [explosionCounter, setExplosionCounter] = useState(0);
  const [nextPiece, setNextPiece] = useState<Tetromino>(() => createNewPiece());

  // Check if a move is valid
  const isValidMove = useCallback(
    (piece: Tetromino, boardState: (TetrominoType | null)[][]): boolean => {
      return piece.shape.every((row, dy) =>
        row.every((cell, dx) => {
          if (cell === 0) return true;
          const newX = piece.position.x + dx;
          const newY = piece.position.y + dy;
          return (
            newX >= 0 &&
            newX < BOARD_WIDTH &&
            newY < BOARD_HEIGHT &&
            (newY < 0 || boardState[newY][newX] === null)
          );
        })
      );
    },
    []
  );

  // Create a new game board with the current piece
  const createBoardWithPiece = useCallback(
    (piece: Tetromino, boardState: (TetrominoType | null)[][]) => {
      const newBoard = boardState.map((row) => [...row]);
      piece.shape.forEach((row, dy) => {
        row.forEach((cell, dx) => {
          if (cell === 1) {
            const newY = piece.position.y + dy;
            const newX = piece.position.x + dx;
            if (newY >= 0 && newY < BOARD_HEIGHT) {
              newBoard[newY][newX] = piece.type;
            }
          }
        });
      });
      return newBoard;
    },
    []
  );

  // Clear completed lines and update score
  const clearLines = useCallback(
    (boardState: (TetrominoType | null)[][]) => {
      let linesCleared = 0;
      const completedLines: number[] = [];

      boardState.forEach((row, index) => {
        if (row.every((cell) => cell !== null)) {
          linesCleared++;
          completedLines.push(index);
        }
      });

      if (completedLines.length > 0) {
        const newExplosions = completedLines.flatMap((lineIndex) =>
          Array.from({ length: BOARD_WIDTH }, (_, i) => ({
            id: explosionCounter + i + lineIndex * BOARD_WIDTH,
            x: i * 34,
            y: lineIndex * 34,
          }))
        );

        setExplosions((prev) => [...prev, ...newExplosions]);
        setExplosionCounter((prev) => prev + newExplosions.length);

        setTimeout(() => {
          const newBoard = boardState.filter(
            (_, index) => !completedLines.includes(index)
          );
          while (newBoard.length < BOARD_HEIGHT) {
            newBoard.unshift(Array(BOARD_WIDTH).fill(null));
          }

          const newScore = gameState.score + linesCleared * 100;
          const newLevel = LEVEL_REQUIREMENTS.reduce((highest, req) => {
            if (newScore >= req.score) {
              return req.level;
            }
            return highest;
          }, 1);

          setGameState((prev) => ({
            ...prev,
            board: newBoard,
            score: newScore,
            lines: prev.lines + linesCleared,
            level: newLevel,
          }));
        }, 100);
      }

      return { newBoard: boardState, linesCleared };
    },
    [explosionCounter, gameState.score]
  );

  // Добавьте функцию для удаления завершенных анимаций
  const handleExplosionComplete = useCallback((explosionId: number) => {
    setExplosions((prev) => prev.filter((exp) => exp.id !== explosionId));
  }, []);

  // Movement functions
  const moveDown = useCallback(() => {
    if (!gameState.currentPiece) return;

    const newPiece = {
      ...gameState.currentPiece,
      position: {
        ...gameState.currentPiece.position,
        y: gameState.currentPiece.position.y + 1,
      },
    };

    if (isValidMove(newPiece, gameState.board)) {
      setGameState((prev) => ({
        ...prev,
        currentPiece: newPiece,
      }));
    } else {
      const newBoard = createBoardWithPiece(
        gameState.currentPiece,
        gameState.board
      );
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);

      const isGameOver = !isValidMove(nextPiece, clearedBoard);
      const newNextPiece = createNewPiece();

      setGameState((prev) => ({
        ...prev,
        board: clearedBoard,
        currentPiece: isGameOver ? null : nextPiece,
        gameOver: isGameOver,
      }));

      if (!isGameOver) {
        setNextPiece(newNextPiece);
      }
    }
  }, [gameState, isValidMove, createBoardWithPiece, clearLines, nextPiece]);

  const moveLeft = useCallback(() => {
    if (!gameState.currentPiece) return;

    const newPiece = {
      ...gameState.currentPiece,
      position: {
        ...gameState.currentPiece.position,
        x: gameState.currentPiece.position.x - 1,
      },
    };

    if (isValidMove(newPiece, gameState.board)) {
      setGameState((prev) => ({
        ...prev,
        currentPiece: newPiece,
      }));
    }
  }, [gameState, isValidMove]);

  const moveRight = useCallback(() => {
    if (!gameState.currentPiece) return;

    const newPiece = {
      ...gameState.currentPiece,
      position: {
        ...gameState.currentPiece.position,
        x: gameState.currentPiece.position.x + 1,
      },
    };

    if (isValidMove(newPiece, gameState.board)) {
      setGameState((prev) => ({
        ...prev,
        currentPiece: newPiece,
      }));
    }
  }, [gameState, isValidMove]);

  const rotate = useCallback(() => {
    if (!gameState.currentPiece) return;

    const rotatedShape = gameState.currentPiece.shape[0].map((_, index) =>
      gameState.currentPiece.shape.map((row) => row[index]).reverse()
    );

    const newPiece = {
      ...gameState.currentPiece,
      shape: rotatedShape,
    };

    if (isValidMove(newPiece, gameState.board)) {
      setGameState((prev) => ({
        ...prev,
        currentPiece: newPiece,
      }));
    }
  }, [gameState, isValidMove]);

  // Start game
  useEffect(() => {
    if (!gameState.currentPiece && !gameState.gameOver) {
      const firstPiece = createNewPiece();
      const newNextPiece = createNewPiece();
      setGameState((prev) => ({
        ...prev,
        currentPiece: firstPiece,
      }));
      setNextPiece(newNextPiece);
    }
  }, [gameState.currentPiece, gameState.gameOver, createNewPiece]);

  // Game loop
  useEffect(() => {
    if (gameState.gameOver) return;

    const speed = Math.max(50, 1000 - (gameState.level - 1) * 150);
    const gameLoop = setInterval(() => {
      moveDown();
    }, speed);

    return () => clearInterval(gameLoop);
  }, [gameState.gameOver, gameState.level, moveDown]);

  // Render current piece on the board
  const displayBoard = gameState.currentPiece
    ? createBoardWithPiece(gameState.currentPiece, gameState.board)
    : gameState.board;

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState.gameOver) return;

      switch (event.key) {
        case "ArrowLeft":
          moveLeft();
          break;
        case "ArrowRight":
          moveRight();
          break;
        case "ArrowDown":
          moveDown();
          break;
        case "ArrowUp":
        case " ": // Space key
          rotate();
          event.preventDefault(); // Prevent page scrolling on space press
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState.gameOver, moveDown, moveLeft, moveRight, rotate]);

  const restartGame = useCallback(() => {
    const firstPiece = createNewPiece();
    const newNextPiece = createNewPiece();
    setGameState({
      board: Array(BOARD_HEIGHT)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(null)),
      currentPiece: firstPiece,
      score: 0,
      gameOver: false,
      level: 1,
      lines: 0,
    });
    setNextPiece(newNextPiece);
  }, [createNewPiece]);

  return (
    <div className={styles.tetrisContainer}>
      <div className={styles.gameBoard}>
        {displayBoard.map((row, y) => (
          <div key={y} className={styles.row}>
            {row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`${styles.cell} ${cell ? styles[cell] : ""}`}
              />
            ))}
          </div>
        ))}
        {explosions.map((explosion) => (
          <BubbleExplosion
            key={explosion.id}
            x={explosion.x}
            y={explosion.y}
            onComplete={() => handleExplosionComplete(explosion.id)}
          />
        ))}
      </div>
      <div className={styles.controlPanel}>
        <div className={styles.controlRow}>
          <button
            className={`${styles.controlButton} ${styles.rotate}`}
            onTouchStart={rotate}
            onClick={(e) => e.preventDefault()}
          >
            ↻
          </button>
        </div>
        <div className={styles.controlRow}>
          <button
            className={styles.controlButton}
            onTouchStart={moveLeft}
            onClick={(e) => e.preventDefault()}
          >
            ←
          </button>
          <button
            className={styles.controlButton}
            onTouchStart={moveDown}
            onTouchEnd={(e) => e.preventDefault()}
            onClick={(e) => e.preventDefault()}
          >
            ↓
          </button>
          <button
            className={styles.controlButton}
            onTouchStart={moveRight}
            onClick={(e) => e.preventDefault()}
          >
            →
          </button>
        </div>
      </div>
      <div className={styles.sidePanel}>
        <GameHelper
          score={gameState.score}
          isGameOver={gameState.gameOver}
          level={gameState.level}
        />
        <NextPiece piece={nextPiece} />
        <div className={styles.gameInfo}>
          <div className={styles.score}>Score: {gameState.score}</div>
          <div className={styles.level}>Level: {gameState.level}</div>
          <div className={styles.lines}>Lines: {gameState.lines}</div>
          {gameState.gameOver && (
            <>
              <div className={styles.gameOver}>Game Over!</div>
              <button className={styles.restartButton} onClick={restartGame}>
                Restart Game
              </button>
            </>
          )}
          {!gameState.gameOver && (
            <button className={styles.restartButton} onClick={restartGame}>
              New Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tetris;
