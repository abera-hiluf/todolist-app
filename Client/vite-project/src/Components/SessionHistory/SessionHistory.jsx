import React from "react";
import styles from "./SessionHistory.module.css";

function SessionHistory({ sessions }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className={styles.container}>
        <h2>Session History</h2>
        <p>No sessions recorded yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Session History</h2>
      <ul className={styles.list}>
        {sessions.map((session) => (
          <li key={session.id} className={styles.item}>
            <div className={styles.taskName}>
              {session.task_name || "Untitled Task"}
            </div>
            <div>
              <strong>Start:</strong>{" "}
              {session.start_time
                ? new Date(session.start_time).toLocaleString()
                : "N/A"}
            </div>
            <div>
              <strong>End:</strong>{" "}
              {session.end_time
                ? new Date(session.end_time).toLocaleString()
                : "In Progress"}
            </div>
            <div>
              <strong>Status:</strong>
              <span
                className={
                  session.status === "completed"
                    ? styles.completedBadge
                    : styles.incompleteBadge
                }
              >
                {session.status || "Unknown"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SessionHistory;
