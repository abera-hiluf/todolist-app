import React, { useState } from "react";
import styles from "./TaskForm.module.css";

function TaskForm({ onAddTask }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!name || name.trim().length === 0) {
      setError("Task name is required.");
      return;
    }
    if (name.length > 30) {
      setError("Task name must be under 30 characters.");
      return;
    }
    if (description && description.length > 100) {
      setError("Description must be under 100 characters.");
      return;
    }
    const parsedDuration = parseInt(duration, 10);
    if (!duration || isNaN(parsedDuration) || parsedDuration <= 0) {
      setError("Please provide a positive numeric duration (in minutes).");
      return;
    }

    onAddTask({ name: name.trim(), description: description.trim(), duration: parsedDuration });
    setName("");
    setDescription("");
    setDuration("");
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Add Task</h2>
      {error && <div className={styles.errorText}>{error}</div>}
      <div className={styles.formGroup}>
        <label htmlFor="name">Task Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="duration">Duration (minutes):</label>
        <input
          type="number"
          id="duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          required
        />
      </div>
      <button type="submit" className={styles.button}>
        Add Task
      </button>
    </form>
  );
}

export default TaskForm;
