import { useEffect, useState } from "react";
import styles from "./BubbleExplosion.module.scss";

interface BubbleExplosionProps {
  x: number;
  y: number;
  onComplete: () => void;
}

const BubbleExplosion = ({ x, y, onComplete }: BubbleExplosionProps) => {
  const [bubbles] = useState(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      size: Math.random() * 10 + 5,
      angle: (Math.PI * 2 * i) / 10,
      speed: Math.random() * 2 + 1,
    }))
  );

  useEffect(() => {
    const timer = setTimeout(onComplete, 600); // Duration of animation
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={styles.explosionContainer}
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className={styles.bubble}
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            transform: `translate(
              ${Math.cos(bubble.angle) * 30 * bubble.speed}px,
              ${Math.sin(bubble.angle) * 30 * bubble.speed}px
            )`,
          }}
        />
      ))}
    </div>
  );
};

export default BubbleExplosion;
