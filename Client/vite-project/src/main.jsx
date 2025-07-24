import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import TimerWindow from "./Components/Timer/TimerWindow";
import "./index.css"; // Vite's default global CSS

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/timer" element={<TimerWindow />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
