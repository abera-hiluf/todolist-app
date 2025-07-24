import React, { useState, useEffect, useRef } from "react";
import styles from "./Timer.module.css";

function TimerWindow() {
  const [timeLeft, setTimeLeftState] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const timerRef = useRef(null);
  const audioRef = useRef(new Audio("/alert.mp3"));

  useEffect(() => {
    if (window.opener && window.opener.duration) {
      setTimeLeftState(window.opener.duration);
    } else {
      console.error("No duration provided");
      window.close();
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftState((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          const now = new Date();
          const sessionData = {
            task_id: window.opener?.taskId || 0,
            start_time:
              window.opener?.startTime ||
              new Date(
                now.getTime() - (window.opener?.duration || 0) * 1000
              ).toISOString(),
            end_time: now.toISOString(),
            status: "completed",
          };
          console.log("Timer complete, session data:", sessionData);
          if (window.opener && window.opener.onComplete) {
            window.opener.onComplete();
          } else if (sessionData.task_id !== 0) {
            localStorage.setItem("sessionData", JSON.stringify(sessionData));
          }
          window.close();
          return 0;
        }
        if (window.opener && window.opener.setTimeLeft) {
          window.opener.setTimeLeft(prev - 1);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const refocusInterval = setInterval(() => {
      if (timeLeft > 0) {
        window.focus();
        audioRef.current.play().catch((err) => {
          console.error("Periodic audio error:", err);
        });
      }
    }, 30000);
    return () => clearInterval(refocusInterval);
  }, [timeLeft]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleStop = () => {
    audioRef.current.play().catch((err) => {
      console.error("Stop audio error:", err);
    });
    const now = new Date();
    const sessionData = {
      task_id: window.opener?.taskId || 0,
      start_time:
        window.opener?.startTime ||
        new Date(
          now.getTime() - (window.opener?.duration || 0) * 1000
        ).toISOString(),
      end_time: now.toISOString(),
      status: "incomplete",
    };
    console.log("Stop session, session data:", sessionData);
    if (window.opener && window.opener.onStop) {
      window.opener.onStop();
    } else if (sessionData.task_id !== 0) {
      localStorage.setItem("sessionData", JSON.stringify(sessionData));
    }
    window.close();
  };

  return (
    <div
      ref={timerRef}
      className={styles.timerContainer}
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      onMouseDown={handleMouseDown}
    >
      <h2 className={styles.timerHeading}>
        Focus Timer: {window.opener?.taskName || "Task"}
      </h2>
      <div className={styles.time}>{formatTime(timeLeft)}</div>
      <button className={styles.button} onClick={handleStop}>
        Stop
      </button>
    </div>
  );
}

export default TimerWindow;
