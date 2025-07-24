import React from "react";
import styles from "./TaskList.module.css";

function TaskList({ tasks, onSelectTask }) {
  return (
    <div className={styles.container}>
      <h2>Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks available.</p>
      ) : (
        <ul className={styles.list}>
          {tasks.map((task) => (
            <li key={task.task_id} className={styles.item}>
              <div>
                <strong>{task.name}</strong> ({task.duration} minutes)
              </div>
              <div>{task.description || "No description"}</div>
              <button
                className={styles.button}
                onClick={() => onSelectTask(task)}
              >
                Start Session
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TaskList;
