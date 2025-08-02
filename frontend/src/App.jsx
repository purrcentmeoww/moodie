// /frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/Home";
import TimeCapsulePage from "./pages/TimeCapsulePage";
import EmpathyWallPage from "./pages/EmpathyWallPage";
import CalendarPage from "./pages/CalendarPage";
import HomePage from "./pages/Homepage";
import Check from "./pages/Appraisement";
import "./App.css";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem("currentUser");
    }
  }, []);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <Router>
      <div className="app-container">
        {currentUser && (
          <Navbar onLogout={handleLogout} username={currentUser.username} />
        )}

        <main className="content">
          <Routes>
            <Route
              path="/"
              element={
                currentUser ? (
                  // --- จุดที่แก้ไข 1 ---
                  <CalendarPage
                    username={currentUser.username}
                    userId={currentUser.id} // ส่ง userId ไปด้วย
                  />
                ) : (
                  <Home onSubmit={handleLogin} />
                )
              }
            />
            {/* --- จุดที่แก้ไข 2 --- */}
            <Route
              path="/calendar"
              element={
                <CalendarPage
                  username={currentUser?.username}
                  userId={currentUser?.id} // ส่ง userId ไปด้วย
                />
              }
            />
            <Route
              path="/time-capsule"
              element={<TimeCapsulePage userId={currentUser?.id} />}
            />
            <Route
              path="/empathy-wall"
              element={<EmpathyWallPage currentUser={currentUser} />}
            />
            <Route path="/analyze" element={<HomePage />} />
            <Route path="/check" element={<Check />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
