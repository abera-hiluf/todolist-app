import React, { useState } from "react";
import styles from "./TaskList.module.css";

function TaskList({ tasks, onSelectTask, onToggleComplete, onDeleteTask }) {
  const [showCompleted, setShowCompleted] = useState(false);

  const activeTasks = tasks.filter((t) => !t.is_completed);
  const completedTasks = tasks.filter((t) => t.is_completed);

  return (
    <div className={styles.container}>
      {/* 1. Active Tasks Section */}
      <h2 className={styles.sectionHeader}>Active Tasks ({activeTasks.length})</h2>
      {activeTasks.length === 0 ? (
        <p className={styles.emptyState}>No active tasks. Create a new one above to start focusing!</p>
      ) : (
        <ul className={styles.list}>
          {activeTasks.map((task) => (
            <li key={task.task_id} className={styles.item}>
              <div className={styles.cardHeader}>
                <div className={styles.titleWrapper}>
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => onToggleComplete(task.task_id)}
                    className={styles.checkbox}
                  />
                  <strong className={styles.title}>{task.name}</strong>
                </div>
                <button
                  onClick={() => onDeleteTask(task.task_id)}
                  className={styles.deleteBtn}
                  title="Delete Task"
                >
                  🗑
                </button>
              </div>

              <div className={styles.durationInfo}>{task.duration} minutes</div>
              
              <div className={styles.description}>
                {task.description || "No description"}
              </div>

              <button
                className={styles.button}
                onClick={() => onSelectTask(task)}
              >
                Start Focus Session
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 2. Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className={styles.completedSection}>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={styles.toggleCompletedBtn}
          >
            <span>
              {showCompleted ? "▼" : "▶"} Completed Tasks ({completedTasks.length})
            </span>
          </button>

          {showCompleted && (
            <ul className={`${styles.list} ${styles.completedList}`}>
              {completedTasks.map((task) => (
                <li key={task.task_id} className={`${styles.item} ${styles.completedItem}`}>
                  <div className={styles.cardHeader}>
                    <div className={styles.titleWrapper}>
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => onToggleComplete(task.task_id)}
                        className={styles.checkbox}
                      />
                      <strong className={`${styles.title} ${styles.completedTitle}`}>
                        {task.name}
                      </strong>
                    </div>
                    <button
                      onClick={() => onDeleteTask(task.task_id)}
                      className={styles.deleteBtn}
                      title="Delete Task"
                    >
                      🗑
                    </button>
                  </div>

                  <div className={styles.durationInfoCompleted}>{task.duration} minutes focused</div>
                  
                  <div className={styles.descriptionCompleted}>
                    {task.description || "No description"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default TaskList;
