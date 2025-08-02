// src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('username');
    onLogout();
    navigate('/');
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">Moodie</Link>
      
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/calendar" onClick={() => setMenuOpen(false)}>Calendar</Link>
        <Link to="/analyze" onClick={() => setMenuOpen(false)}>Analyze</Link>
        <Link to="/time-capsule" onClick={() => setMenuOpen(false)}>Time Capsule</Link>
        <Link to="/empathy-wall" onClick={() => setMenuOpen(false)}>Empathy Wall</Link>
        <Link to="/Check" onClick={() => setMenuOpen(false)}>Check</Link>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
