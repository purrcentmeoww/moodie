import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import TimeCapsulePage from './pages/TimeCapsulePage';
import EmpathyWallPage from './pages/EmpathyWallPage';
import CalendarPage from './pages/CalendarPage';
import HomePage from './pages/Homepage';
import './App.css';

function App() {
  const [username, setUsername] = useState('');

  // โหลดค่าจาก localStorage เมื่อ component โหลดครั้งแรก
  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleLogin = (name) => {
    setUsername(name);
    localStorage.setItem('username', name); // เก็บลง localStorage ด้วย
  };

  return (
    <Router>
      <div className="app-container">
        {/* แสดง Navbar เมื่อมี username */}
        {username && <Navbar />}

        <main className="content">
          <Routes>
            <Route
              path="/"
              element={
                username ? (
                  <CalendarPage username={username} />
                ) : (
                  <Home onSubmit={handleLogin} />
                )
              }
            />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/time-capsule" element={<TimeCapsulePage />} />
            <Route path="/empathy-wall" element={<EmpathyWallPage />} />
            <Route path="/analyze" element={<HomePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
