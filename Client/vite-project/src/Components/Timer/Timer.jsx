import React, { useState, useEffect, useRef } from "react";
import styles from "./Timer.module.css";

function Timer({ task, onComplete, onCancel }) {
  const [timeLeft, setTimeLeft] = useState(task.duration * 60);
  const [isActive, setIsActive] = useState(true);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const intervalRef = useRef(null);
  const audioRef = useRef(new Audio("/alert.wav"));
  const startTimeRef = useRef(new Date());

  const isTimerCounting = isActive && !showConfirmExit;

  // Sync audio volume
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  // Timer countdown hook
  useEffect(() => {
    if (isTimerCounting && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTimerCounting, timeLeft]);

  // Handle completion when time hits 0
  useEffect(() => {
    if (timeLeft === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsActive(false);
      
      // Play alert chime
      audioRef.current.play().catch((err) => console.log("Audio play blocked: ", err));
      
      // Trigger complete callback
      onComplete({
        task_id: task.task_id,
        start_time: startTimeRef.current.toISOString(),
        end_time: new Date().toISOString(),
        status: "completed",
      });
    }
  }, [timeLeft, task, onComplete]);

  // Periodic alarm notification (every 30 seconds if active)
  useEffect(() => {
    let alarmInterval;
    if (isTimerCounting && timeLeft > 0) {
      alarmInterval = setInterval(() => {
        audioRef.current.play().catch((err) => console.log("Periodic audio play blocked: ", err));
      }, 30000);
    }
    return () => {
      if (alarmInterval) clearInterval(alarmInterval);
    };
  }, [isTimerCounting, timeLeft]);

  const handleTogglePause = () => {
    setIsActive(!isActive);
  };

  const handleStop = () => {
    // Shows the custom confirmation overlay, pausing the timer
    setShowConfirmExit(true);
  };

  const handleConfirmExit = () => {
    onCancel({
      task_id: task.task_id,
      start_time: startTimeRef.current.toISOString(),
      end_time: new Date().toISOString(),
      status: "incomplete",
    });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Calculate progress percentage
  const totalSeconds = task.duration * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Focusing on: {task.name}</h2>
        {task.description && <p className={styles.desc}>{task.description}</p>}
        
        <div className={styles.timerCircle}>
          <svg className={styles.svgRing}>
            <circle
              className={styles.bgCircle}
              cx="100"
              cy="100"
              r="85"
            />
            <circle
              className={styles.fgCircle}
              cx="100"
              cy="100"
              r="85"
              style={{
                strokeDasharray: 534,
                strokeDashoffset: 534 - (534 * progressPercent) / 100,
              }}
            />
          </svg>
          <div className={styles.timeText}>{formatTime(timeLeft)}</div>
        </div>

        {/* Volume Slider Control */}
        <div className={styles.volumeWrapper}>
          <span className={styles.volumeIcon}>🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className={styles.volumeSlider}
          />
        </div>

        <div className={styles.actions}>
          <button 
            onClick={handleTogglePause} 
            className={isActive ? styles.pauseBtn : styles.resumeBtn}
            disabled={showConfirmExit}
          >
            {isActive ? "Pause" : "Resume"}
          </button>
          <button onClick={handleStop} className={styles.stopBtn} disabled={showConfirmExit}>
            Stop
          </button>
        </div>
      </div>

      {showConfirmExit && (
        <div className={styles.confirmExitOverlay}>
          <div className={styles.confirmExitCard}>
            <h3>Pause & Exit Session?</h3>
            <p>
              Are you sure you want to stop early? Your progress will be saved as <strong>incomplete</strong>.
            </p>
            <div className={styles.confirmExitActions}>
              <button onClick={handleConfirmExit} className={styles.confirmStopBtn}>
                Stop Anyway
              </button>
              <button onClick={() => setShowConfirmExit(false)} className={styles.confirmCancelBtn}>
                Keep Focusing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Timer;
