import { useEffect, useState } from "react";
import styles from "./GameHelper.module.scss";

interface GameHelperProps {
  score: number;
  isGameOver: boolean;
  level: number;
}

// Updated level requirements with more balanced progression
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

const GameHelper = ({ score, isGameOver, level }: GameHelperProps) => {
  const [message, setMessage] = useState("");
  const [mood, setMood] = useState<"happy" | "sad" | "neutral">("neutral");
  const [prevScore, setPrevScore] = useState(0);
  const [showLevels, setShowLevels] = useState(false);

  // Find current level based on score
  const currentLevel = LEVEL_REQUIREMENTS.reduce((highest, req) => {
    if (score >= req.score) {
      return req.level;
    }
    return highest;
  }, 1);

  const nextLevel = LEVEL_REQUIREMENTS.find((req) => req.level > currentLevel);
  const scoreToNextLevel = nextLevel ? nextLevel.score - score : 0;

  useEffect(() => {
    if (isGameOver) {
      setMessage("Oh no! Don't worry, you can try again!");
      setMood("sad");
      return;
    }

    if (score > prevScore) {
      const messages = [
        "Great job! Keep it up! 🎉",
        "You're doing amazing! 🌟",
        "Fantastic move! 🎮",
        "That's the way! 🚀",
      ];
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
      setMood("happy");
    } else if (currentLevel > 1) {
      setMessage(`Level ${currentLevel}! You're getting faster! 💨`);
      setMood("happy");
    } else {
      setMessage("Let's play Tetris! Use arrows to move, space to rotate!");
      setMood("neutral");
    }

    setPrevScore(score);
  }, [score, isGameOver, currentLevel, prevScore]);

  return (
    <div className={styles.helperContainer}>
      <div className={`${styles.helper} ${styles[mood]}`}>
        <div className={styles.face}>
          <div className={styles.eyes}>
            <div className={styles.eye}></div>
            <div className={styles.eye}></div>
          </div>
          <div className={styles.mouth}></div>
        </div>
      </div>
      <div className={styles.message}>{message}</div>
      <button
        className={styles.levelInfoButton}
        onClick={() => setShowLevels(!showLevels)}
      >
        {showLevels ? "Hide Levels" : "Show Levels"}
      </button>
      {showLevels && (
        <div className={styles.levelInfo}>
          <div className={styles.nextLevel}>
            {nextLevel ? (
              <p>Next Level in: {scoreToNextLevel} points</p>
            ) : (
              <p>Max Level Reached!</p>
            )}
          </div>
          <div className={styles.levelList}>
            {LEVEL_REQUIREMENTS.map((req) => (
              <div
                key={req.level}
                className={`${styles.levelItem} ${
                  currentLevel >= req.level ? styles.achieved : ""
                }`}
              >
                <span>Level {req.level}</span>
                <span>{req.score.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameHelper;
