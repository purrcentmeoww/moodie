// src/components/layout/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('username');
    onLogout();             // เคลียร์ state ใน App.jsx
    navigate('/');          // กลับหน้า Home
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">Moodie</Link>
      <div className="nav-links">
        <Link to="/calendar">Calendar</Link>
        <Link to="/analyze">Analyze</Link>
        <Link to="/time-capsule">Time Capsule</Link>
        <Link to="/empathy-wall">Empathy Wall</Link>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
