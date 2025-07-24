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
      .then((res) => {
        console.log("Fetched tasks:", res.data);
        setTasks(res.data);
      })
      .catch((err) => {
        console.error("Fetch tasks error:", err);
        setError("Failed to load tasks: " + err.message);
      });
  }, []);

  // Load sessions
  useEffect(() => {
    fetchSessions()
      .then((res) => {
        console.log("Fetched sessions:", res.data);
        setSessions(res.data);
      })
      .catch((err) => {
        console.error("Fetch sessions error:", err);
        setError("Failed to load sessions: " + err.message);
      });
  }, []);

  // Handle beforeunload event
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

  // Monitor localStorage for session updates
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "sessionData" && e.newValue) {
        const sessionData = JSON.parse(e.newValue);
        console.log("Received session data from timer:", sessionData);
        if (sessionData.task_id && sessionData.task_id !== 0) {
          createSession(sessionData)
            .then((res) => {
              console.log("Session saved successfully, id:", res.data.id);
              return fetchSessions();
            })
            .then((res) => {
              console.log("Sessions updated:", res.data);
              setSessions(res.data);
              localStorage.removeItem("sessionData");
            })
            .catch((err) => {
              console.error(
                "Create session error:",
                err.response?.data || err.message
              );
              setError(
                "Failed to save session: " +
                  (err.response?.data?.error || err.message)
              );
            });
        } else {
          console.error("Invalid session data:", sessionData);
          setError("Cannot save session: Invalid task_id");
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleAddTask = (newTask) => {
    createTask(newTask)
      .then((res) => {
        console.log("Task created:", { ...newTask, task_id: res.data.id });
        setTasks([...tasks, { ...newTask, task_id: res.data.id }]);
        setError(null);
      })
      .catch((err) => {
        console.error("Create task error:", err);
        setError("Failed to add task: " + err.message);
      });
  };

  const handleSelectTask = (task) => {
    console.log("Selected task:", task);
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
      console.error("Invalid task selected:", selectedTask);
      setError("Please select a valid task with a positive numeric duration");
      return;
    }
    console.log(
      "Starting session for task:",
      selectedTask,
      "Duration (seconds):",
      selectedTask.duration * 60
    );
    setShowModal(false);
    setTimerRunning(true);
    startTimeRef.current = new Date();

    const timerWindow = window.open(
      "/timer",
      "TimerWindow",
      "width=300,height=200,menubar=no,toolbar=no,location=no,status=no"
    );
    if (!timerWindow) {
      console.error("Timer window blocked");
      setError("Popup blocked. Please allow popups and try again.");
      setTimerRunning(false);
      setShowModal(true);
      setModalType("start");
      return;
    }
    timerWindowRef.current = timerWindow;

    // Pass data to timer window
    timerWindow.taskName = selectedTask.name;
    timerWindow.duration = selectedTask.duration * 60; // Convert minutes to seconds
    timerWindow.taskId = selectedTask.task_id;
    timerWindow.startTime = startTimeRef.current.toISOString();
    console.log("Timer window initialized with:", {
      taskName: timerWindow.taskName,
      duration: timerWindow.duration,
      taskId: timerWindow.taskId,
      startTime: timerWindow.startTime,
    });

    timerWindow.onStop = () => {
      console.log("Timer window requested stop");
      setModalType("stop");
      setShowModal(true);
    };
    timerWindow.onComplete = handleTimerComplete;
    timerWindow.setTimeLeft = (timeLeft) => {
      console.log("Updating timeLeft in parent:", timeLeft);
      setSelectedTask({ ...selectedTask, timeLeft });
    };

    const checkWindowClosed = setInterval(() => {
      if (timerWindowRef.current && timerWindowRef.current.closed) {
        console.log("Timer window closed unexpectedly");
        clearInterval(checkWindowClosed);
        if (timerRunning) {
          handleStopSession();
        }
      }
    }, 500);
  };

  const handleStopSession = () => {
    if (timerRunning) {
      console.log("Stopping session for task:", selectedTask);
      setModalType("stop");
      setShowModal(true);
    }
  };

  const handleConfirmStop = () => {
    console.log("Confirming stop for task:", selectedTask);
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
      console.log("Saving session:", sessionData);
      createSession(sessionData)
        .then((res) => {
          console.log("Session saved successfully, id:", res.data.id);
          return fetchSessions();
        })
        .then((res) => {
          console.log("Sessions updated:", res.data);
          setSessions(res.data);
        })
        .catch((err) => {
          console.error(
            "Create session error:",
            err.response?.data || err.message
          );
          setError(
            "Failed to save session: " +
              (err.response?.data?.error || err.message)
          );
        });
    } else {
      console.error("No selected task or start time");
      setError("Cannot save session: No task selected or session not started");
    }
    setSelectedTask(null);
    startTimeRef.current = null;
    if (timerWindowRef.current) {
      timerWindowRef.current.close();
      timerWindowRef.current = null;
    }
  };

  const handleTimerComplete = () => {
    console.log("Timer completed for task:", selectedTask);
    if (selectedTask && startTimeRef.current && selectedTask.task_id) {
      const now = new Date();
      const sessionData = {
        task_id: selectedTask.task_id,
        start_time: startTimeRef.current.toISOString(),
        end_time: now.toISOString(),
        status: "completed",
      };
      console.log("Saving session:", sessionData);
      createSession(sessionData)
        .then((res) => {
          console.log("Session saved successfully, id:", res.data.id);
          return fetchSessions();
        })
        .then((res) => {
          console.log("Sessions updated:", res.data);
          setSessions(res.data);
        })
        .catch((err) => {
          console.error(
            "Create session error:",
            err.response?.data || err.message
          );
          setError(
            "Failed to save session: " +
              (err.response?.data?.error || err.message)
          );
        });
    } else {
      console.error("No selected task or start time");
      setError("Cannot save session: No task selected or session not started");
    }
    setTimerRunning(false);
    setSelectedTask(null);
    startTimeRef.current = null;
    alert("Session complete!");
    if (timerWindowRef.current) {
      timerWindowRef.current.close();
      timerWindowRef.current = null;
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        textAlign: "left",
        writingMode: "horizontal-tb",
      }}
    >
      <h1>Focus Time Tracker</h1>
      {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>
      )}
      <TaskForm onAddTask={handleAddTask} />
      <TaskList tasks={tasks} onSelectTask={handleSelectTask} />
      <SessionHistory sessions={sessions} />
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
