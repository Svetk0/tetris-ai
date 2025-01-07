import { Tetromino } from "@/types/tetris";
import styles from "./NextPiece.module.scss";
import { useMemo } from "react";

interface NextPieceProps {
  piece: Tetromino;
}

const NextPiece = ({ piece }: NextPieceProps) => {
  const gridSize = 4;

  // Use useMemo to create the grid to ensure consistency
  const grid = useMemo(() => {
    const newGrid = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(null));

    const offsetX = Math.floor((gridSize - piece.shape[0].length) / 2);
    const offsetY = Math.floor((gridSize - piece.shape.length) / 2);

    piece.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 1) {
          newGrid[y + offsetY][x + offsetX] = piece.type;
        }
      });
    });

    return newGrid;
  }, [piece]);

  return (
    <div className={styles.nextPiece}>
      <div className={styles.title}>Next</div>
      <div className={styles.preview}>
        {grid.map((row, y) => (
          <div key={y} className={styles.row}>
            {row.map((cell, x) => {
              const cellClassName = cell
                ? `${styles.cell} ${styles[cell]}`
                : styles.cell;
              return <div key={`${x}-${y}`} className={cellClassName} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NextPiece;
