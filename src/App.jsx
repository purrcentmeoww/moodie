// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import Navbar from './components/layout/Navbar';
import Home from './pages/Home'; // หน้าแรกให้กรอกชื่อ
import TimeCapsulePage from './pages/TimeCapsulePage';
import EmpathyWallPage from './pages/EmpathyWallPage';
import CalendarPage from './pages/CalendarPage';
import HomePage from './pages/Homepage'; // สำหรับ analyze

import './App.css';

function App() {
  const [username, setUsername] = useState('');

  // โหลด username จาก localStorage เมื่อโหลดแอป
  useEffect(() => {
    const storedName = localStorage.getItem('username');
    if (storedName) {
      setUsername(storedName);
    }
  }, []);

  // เมื่อ login สำเร็จ
  const handleLogin = (name) => {
    setUsername(name);
    localStorage.setItem('username', name);
  };

  // เมื่อ logout
  const handleLogout = () => {
    setUsername('');
    localStorage.removeItem('username');
  };

  return (
    <Router>
      <div className="app-container">
        {/* แสดง Navbar เฉพาะเมื่อ login แล้ว */}
        {username && <Navbar onLogout={handleLogout} />}

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
