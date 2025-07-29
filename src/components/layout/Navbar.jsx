// src/components/layout/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">Moodie</Link>
      <div className="nav-links">
      <Link to="/calendar">Calendar</Link> {/* ← เพิ่มตัวเลือก */}
      <Link to="/analyze">Analyze</Link>
      <Link to="/time-capsule">Time Capsule</Link>
      <Link to="/empathy-wall">Empathy Wall</Link>
      </div>
    </nav>
  );
}

export default Navbar;
