import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
});

// Request interceptor to attach JWT token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const loginUser = (data) => instance.post("/auth/login", data);
export const registerUser = (data) => instance.post("/auth/register", data);

// Fetch all tasks
export const fetchTasks = () => instance.get("/tasks");

// Create a new task
export const createTask = (data) => instance.post("/tasks", data);

// Fetch all sessions
export const fetchSessions = () => instance.get("/sessions");

// Create a new session
export const createSession = (data) => instance.post("/sessions", data);

// Toggle task completion status
export const toggleTaskCompletion = (taskId) => instance.patch(`/tasks/${taskId}/toggle`);

// Delete a task
export const deleteTask = (taskId) => instance.delete(`/tasks/${taskId}`);
