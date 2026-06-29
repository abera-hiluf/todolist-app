import React, { useState, useEffect } from "react";
import TaskForm from "./Components/TaskForm/TaskForm";
import TaskList from "./Components/TaskList/TaskList";
import SessionHistory from "./Components/SessionHistory/SessionHistory";
import Modal from "./Components/Modal/Modal";
import Timer from "./Components/Timer/Timer";
import AuthForm from "./Components/Auth/AuthForm";
import Toast from "./Components/Toast/Toast";
import {
  fetchTasks,
  createTask,
  fetchSessions,
  createSession,
  toggleTaskCompletion,
  deleteTask,
} from "./Components/api/api";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showNotification = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken("");
    setUsername("");
    setTasks([]);
    setSessions([]);
    setSelectedTask(null);
    setTimerRunning(false);
    setError(null);
    showNotification("Logged out successfully.", "info");
  };

  const handleAuthSuccess = (newToken, newUsername) => {
    setToken(newToken);
    setUsername(newUsername);
    showNotification(`Welcome back, ${newUsername}!`, "success");
  };

  // Load tasks & sessions on token change
  useEffect(() => {
    if (token) {
      setError(null);
      
      fetchTasks()
        .then((res) => setTasks(res.data))
        .catch((err) => {
          if (err.response?.status === 401) {
            handleLogout();
          } else {
            setError("Failed to load tasks: " + err.message);
          }
        });

      fetchSessions()
        .then((res) => setSessions(res.data))
        .catch((err) => {
          if (err.response?.status === 401) {
            handleLogout();
          } else {
            setError("Failed to load sessions: " + err.message);
          }
        });
    }
  }, [token]);

  // Warn user if timer is running and they attempt to close the tab
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (timerRunning) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [timerRunning]);

  const handleAddTask = (newTask) => {
    createTask(newTask)
      .then((res) => {
        setTasks([...tasks, { ...newTask, task_id: res.data.id, is_completed: 0 }]);
        showNotification(`Task "${newTask.name}" added successfully!`, "success");
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          handleLogout();
        } else {
          showNotification("Failed to add task: " + err.message, "error");
        }
      });
  };

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleStartSession = () => {
    if (
      !selectedTask ||
      !selectedTask.task_id ||
      !selectedTask.duration ||
      isNaN(selectedTask.duration) ||
      selectedTask.duration <= 0
    ) {
      showNotification("Please select a valid task with a positive numeric duration.", "error");
      return;
    }
    setShowModal(false);
    setTimerRunning(true);
  };

  const handleTimerComplete = (sessionData) => {
    createSession(sessionData)
      .then(() => fetchSessions())
      .then((res) => {
        setSessions(res.data);
        setTimerRunning(false);
        setSelectedTask(null);
        showNotification(`Great job! Focus session completed for "${selectedTask.name}"! 🔥`, "success");
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          handleLogout();
        } else {
          showNotification("Failed to save completed session: " + (err.message || ""), "error");
          setTimerRunning(false);
          setSelectedTask(null);
        }
      });
  };

  const handleTimerCancel = (sessionData) => {
    createSession(sessionData)
      .then(() => fetchSessions())
      .then((res) => {
        setSessions(res.data);
        setTimerRunning(false);
        setSelectedTask(null);
        showNotification(`Focus session on "${selectedTask.name}" was stopped early.`, "info");
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          handleLogout();
        } else {
          showNotification("Failed to save incomplete session: " + (err.message || ""), "error");
          setTimerRunning(false);
          setSelectedTask(null);
        }
      });
  };

  const handleToggleTaskCompletion = (taskId) => {
    toggleTaskCompletion(taskId)
      .then((res) => {
        setTasks(
          tasks.map((t) =>
            t.task_id === taskId
              ? { ...t, is_completed: res.data.is_completed }
              : t
          )
        );
        showNotification(
          res.data.is_completed === 1
            ? "Task marked as completed! 🎉"
            : "Task marked as active.",
          "success"
        );
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          handleLogout();
        } else {
          showNotification("Failed to update task: " + err.message, "error");
        }
      });
  };

  const handleDeleteTask = (taskId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task? This will also remove all its session history."
    );
    if (!confirmDelete) return;

    deleteTask(taskId)
      .then(() => {
        setTasks(tasks.filter((t) => t.task_id !== taskId));
        // Refresh sessions to clear cascade deleted tasks
        fetchSessions().then((res) => setSessions(res.data));
        showNotification("Task deleted successfully.", "info");
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          handleLogout();
        } else {
          showNotification("Failed to delete task: " + err.message, "error");
        }
      });
  };

  if (!token) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div style={{ padding: "2rem", textAlign: "left" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "1rem",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Focus Time Tracker</h1>
          <span style={{ color: "#64748b", fontSize: "0.95rem" }}>
            Logged in as: <strong>{username}</strong>
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: "0.55rem 1.1rem",
            backgroundColor: "#ef4444",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </header>

      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
      )}
      <TaskForm onAddTask={handleAddTask} />
      
      <TaskList
        tasks={tasks}
        onSelectTask={handleSelectTask}
        onToggleComplete={handleToggleTaskCompletion}
        onDeleteTask={handleDeleteTask}
      />

      <SessionHistory sessions={sessions} />

      {showModal && selectedTask && (
        <Modal onClose={() => setShowModal(false)}>
          <h2>Start Session</h2>
          <p>
            Start focus session for <strong>{selectedTask.name}</strong> (
            {selectedTask.duration} minutes)?
          </p>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button onClick={handleStartSession}>Start</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {timerRunning && selectedTask && (
        <Timer
          task={selectedTask}
          onComplete={handleTimerComplete}
          onCancel={handleTimerCancel}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;

