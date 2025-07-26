import React, { useState, useEffect, useRef } from "react";
import styles from "./Timer.module.css";

function TimerWindow() {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const intervalRef = useRef(null);
  const audioRef = useRef(new Audio("/alert.wav"));
const [timeLeft, setTimeLeft] = useState(() => {
  const searchParams = new URLSearchParams(window.location.search);
  const minutes = parseInt(searchParams.get("duration") || "5", 10); // default 5
  return minutes * 60;
});

  // Timer countdown logic
  useEffect(() => {
    if (timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [timeLeft]);
useEffect(() => {
  const unlockAudio = () => {
    audioRef.current.play().catch(() => {});
  };
  document.addEventListener("click", unlockAudio, { once: true });
  return () => document.removeEventListener("click", unlockAudio);
}, []);

  // Periodic sound every 30 seconds if timer is running
  useEffect(() => {
    const periodic = setInterval(() => {
      if (timeLeft > 0) {
        window.focus();
        audioRef.current
          .play()
          .catch((err) => console.error("Periodic audio error:", err));
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(periodic);
  }, [timeLeft]);

  // Format time as mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle early stop
  const handleStop = () => {
    if (timeLeft > 0) {
      audioRef.current
        .play()
        .catch((err) => console.error("Stop audio error:", err));
      alert("You cannot stop before time ends!");
    } else {
      clearInterval(intervalRef.current);
      alert("Timer ended.");
    }
  };

  return (
    <div
      className={styles.timerWindow}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        left: position.x,
        top: position.y,
        position: "absolute",
        zIndex: 9999,
      }}
    >
      <h3>Focus Timer</h3>
      <p className={styles.time}>{formatTime(timeLeft)}</p>
      <button onClick={handleStop} className={styles.stopBtn}>
        Stop
      </button>
    </div>
  );
}

export default TimerWindow;
