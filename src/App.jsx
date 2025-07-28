// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import หน้าต่างๆ และ Layout
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import TimeCapsulePage from './pages/TimeCapsulePage';
import EmpathyWallPage from './pages/EmpathyWallPage';

import './App.css'; // สามารถเก็บ CSS ที่ใช้ร่วมกันทั้งแอปไว้ที่นี่

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/time-capsule" element={<TimeCapsulePage />} />
            <Route path="/empathy-wall" element={<EmpathyWallPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;