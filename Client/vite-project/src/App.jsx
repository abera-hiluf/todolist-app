import React, { useState, useEffect, useRef } from "react";
import TaskForm from "./Components/TaskForm/TaskForm";
import TaskList from "./Components/TaskList/TaskList";
import SessionHistory from "./Components/SessionHistory/SessionHistory";
import Modal from "./Components/Modal/Modal";
import {
  fetchTasks,
  createTask,
  fetchSessions,
  createSession,
} from "./Components/api/api";

function App() {
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const timerWindowRef = useRef(null);
  const startTimeRef = useRef(null);

  // Load tasks
  useEffect(() => {
    fetchTasks()
      .then((res) => setTasks(res.data))
      .catch((err) => setError("Failed to load tasks: " + err.message));
  }, []);

  // Load sessions
  useEffect(() => {
    fetchSessions()
      .then((res) => setSessions(res.data))
      .catch((err) => setError("Failed to load sessions: " + err.message));
  }, []);

  // Handle beforeunload event (warn user if timer is running)
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

  // Listen for sessionData updates from timer popup (via localStorage)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "sessionData" && e.newValue) {
        const sessionData = JSON.parse(e.newValue);
        if (sessionData.task_id && sessionData.task_id !== 0) {
          createSession(sessionData)
            .then(() => fetchSessions())
            .then((res) => setSessions(res.data))
            .catch((err) =>
              setError("Failed to save session: " + (err.message || ""))
            );
          localStorage.removeItem("sessionData");
          setTimerRunning(false);
          setSelectedTask(null);
          startTimeRef.current = null;
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleAddTask = (newTask) => {
    createTask(newTask)
      .then((res) => setTasks([...tasks, { ...newTask, task_id: res.data.id }]))
      .catch((err) => setError("Failed to add task: " + err.message));
  };

  const handleSelectTask = (task) => {
    setSelectedTask(task);
    setModalType("start");
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
      setError("Please select a valid task with a positive numeric duration");
      return;
    }
    setShowModal(false);
    setTimerRunning(true);
    startTimeRef.current = new Date();

    const timerWindow = window.open(
      `/timer?duration=${selectedTask.duration}`,
      "TimerWindow",
      "width=320,height=250,menubar=no,toolbar=no,location=no,status=no"
    );

    if (!timerWindow) {
      setError("Popup blocked. Please allow popups and try again.");
      setTimerRunning(false);
      setShowModal(true);
      setModalType("start");
      return;
    }
    timerWindowRef.current = timerWindow;

    // Pass task info to popup window via window properties
    timerWindow.taskName = selectedTask.name;
    timerWindow.duration = selectedTask.duration; // in minutes
    timerWindow.taskId = selectedTask.task_id;
    timerWindow.startTime = startTimeRef.current.toISOString();

    // Define callbacks to handle stop and complete actions from popup
    timerWindow.onStop = () => {
      setModalType("stop");
      setShowModal(true);
    };
    timerWindow.onComplete = () => {
      // On complete, save session and update sessions list
      if (selectedTask && startTimeRef.current) {
        const now = new Date();
        const sessionData = {
          task_id: selectedTask.task_id,
          start_time: startTimeRef.current.toISOString(),
          end_time: now.toISOString(),
          status: "completed",
        };
        createSession(sessionData)
          .then(() => fetchSessions())
          .then((res) => setSessions(res.data))
          .catch((err) =>
            setError("Failed to save session: " + (err.message || ""))
          );
      }
      setTimerRunning(false);
      setSelectedTask(null);
      startTimeRef.current = null;
    };

    // Optional: monitor if popup closed unexpectedly
    const checkWindowClosed = setInterval(() => {
      if (timerWindowRef.current && timerWindowRef.current.closed) {
        clearInterval(checkWindowClosed);
        if (timerRunning) {
          handleStopSession();
        }
      }
    }, 500);
  };

  const handleStopSession = () => {
    if (timerRunning) {
      setModalType("stop");
      setShowModal(true);
    }
  };

  const handleConfirmStop = () => {
    setTimerRunning(false);
    setShowModal(false);

    if (selectedTask && startTimeRef.current && selectedTask.task_id) {
      const now = new Date();
      const sessionData = {
        task_id: selectedTask.task_id,
        start_time: startTimeRef.current.toISOString(),
        end_time: now.toISOString(),
        status: "incomplete",
      };
      createSession(sessionData)
        .then(() => fetchSessions())
        .then((res) => setSessions(res.data))
        .catch((err) =>
          setError("Failed to save session: " + (err.message || ""))
        );
    }
    setSelectedTask(null);
    startTimeRef.current = null;

    // Close popup if open
    if (timerWindowRef.current && !timerWindowRef.current.closed) {
      timerWindowRef.current.close();
      timerWindowRef.current = null;
    }
  };

  return (
    <div style={{ padding: "2rem", textAlign: "left" }}>
      <h1>Focus Time Tracker</h1>
      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
      )}
      <TaskForm onAddTask={handleAddTask} />
      <TaskList tasks={tasks} onSelectTask={handleSelectTask} />
      <SessionHistory sessions={sessions} />

      {timerRunning && (
        <div style={{ margin: "1rem 0", fontWeight: "bold" }}>
          Session running for: <em>{selectedTask?.name}</em>
          <button onClick={handleStopSession} style={{ marginLeft: "1rem" }}>
            Stop
          </button>
        </div>
      )}

      {showModal && selectedTask && (
        <Modal onClose={() => setShowModal(false)}>
          {modalType === "start" ? (
            <>
              <h2>Start Session</h2>
              <p>
                Start session for <strong>{selectedTask.name}</strong> (
                {selectedTask.duration} minutes)?
              </p>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button onClick={handleStartSession}>Start</button>
                <button onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <h2>Stop Session</h2>
              <p>
                Nope! Finish your time for <strong>{selectedTask.name}</strong>.
              </p>
              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button onClick={handleConfirmStop}>Stop Anyway</button>
                <button onClick={() => setShowModal(false)}>Continue</button>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

export default App;
