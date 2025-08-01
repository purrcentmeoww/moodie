import React, { useState } from 'react';
import './CalendarPage.css';

const mockAnalyzeMoodAPI = async (text) => {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('ดี') || lowerText.includes('สุข') || lowerText.includes('สนุก')) {
    return 'happy';
  } else if (lowerText.includes('เศร้า') || lowerText.includes('ร้องไห้')) {
    return 'sad';
  } else if (lowerText.includes('โมโห') || lowerText.includes('โกรธ')) {
    return 'angry';
  } else {
    return 'neutral';
  }
};

const moodColors = {
  happy: '#FFD700',
  sad: '#87CEFA',
  angry: '#FF6347',
  neutral: '#D3D3D3'
};

function CalendarPage({ username }) {
  const today = new Date();
  const currentDay = today.getDate();
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const [entries, setEntries] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [text, setText] = useState('');

  const handleSave = async () => {
    const mood = await mockAnalyzeMoodAPI(text);
    setEntries({
      ...entries,
      [selectedDay]: { text, mood }
    });
    setText('');
    setSelectedDay(null);
  };

  return (
    <div className="calendar-page">
      <h2>Hello, {username}!</h2>
      <div className="calendar">
        {days.map((day) => (
          <div
            key={day}
            className={`day ${day === currentDay ? 'current-day' : ''}`}
            onClick={() => setSelectedDay(day)}
            style={{
              backgroundColor: entries[day]?.mood
                ? moodColors[entries[day].mood]
                : day === currentDay
                ? '#fff'
                : '#fff'
            }}
          >
            {day}
          </div>
        ))}
      </div>
      {selectedDay && (
        <div className="entry-box">
          <h3>Day {selectedDay} Note</h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your diary..."
          ></textarea>
          <button onClick={handleSave}>Analyze & Save</button>
        </div>
      )}
    </div>
  );
}

export default CalendarPage;
