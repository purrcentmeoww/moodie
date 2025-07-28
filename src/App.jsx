import React, { useState } from 'react';
import './App.css';
import CalendarPage from './CalendarPage.jsx';

function App() {
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="app">
      {!submitted ? (
        <form onSubmit={handleSubmit} className="form">
          <h1>Welcome to Mood Tracker</h1>
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <button type="submit">Submit</button>
        </form>
      ) : (
        <CalendarPage username={username} />
      )}
    </div>
  );
}

export default App;