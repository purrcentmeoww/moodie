// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 

import Navbar from './components/layout/Navbar';
import Home from './pages/Home'; // หน้าแรกให้กรอกชื่อ
import TimeCapsulePage from './pages/TimeCapsulePage';
import EmpathyWallPage from './pages/EmpathyWallPage';
import CalendarPage from './pages/CalendarPage';
import HomePage from './pages/HomePage'; // สำหรับ analyze หน้าอื่น ๆ
import './App.css';

function App() {
  const [username, setUsername] = useState('');

  const handleLogin = (name) => {
    setUsername(name);
  };

  return (
    <Router>
      <div className="app-container">
        {/* แสดง Navbar เฉพาะเมื่อ login แล้ว */}
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
