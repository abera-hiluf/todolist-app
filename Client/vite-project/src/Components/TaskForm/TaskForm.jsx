import React, { useState } from "react";
import styles from "./TaskForm.module.css";

function TaskForm({ onAddTask }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !duration || isNaN(duration) || duration <= 0) {
      alert("Please provide a valid task name and duration");
      return;
    }
    onAddTask({ name, description, duration: parseInt(duration) });
    setName("");
    setDescription("");
    setDuration("");
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Add Task</h2>
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
