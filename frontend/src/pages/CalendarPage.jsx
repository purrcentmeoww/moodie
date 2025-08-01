// /frontend/src/pages/CalendarPage.jsx
import React, { useState, useEffect } from 'react';
import './CalendarPage.css';
import { getCalendarEntries, saveCalendarEntry } from '../services/calendarService';

const mockAnalyzeMoodAPI = async (text) => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('ดี') || lowerText.includes('สุข') || lowerText.includes('สนุก')) return 'happy';
  if (lowerText.includes('เศร้า') || lowerText.includes('ร้องไห้')) return 'sad';
  if (lowerText.includes('โมโห') || lowerText.includes('โกรธ')) return 'angry';
  return 'neutral';
};

const moodColors = {
  happy: '#FFD700',
  sad: '#87CEFA',
  angry: '#FF6347',
  neutral: '#D3D3D3'
};

function CalendarPage({ username, userId }) {
  const [entries, setEntries] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [text, setText] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const fetchEntries = async () => {
    if (!userId) return;
    try {
      const dataFromApi = await getCalendarEntries(userId);
      const entriesObject = {};
      dataFromApi.forEach(entry => {
        // *** แก้ไขเรื่อง Timezone ตอนดึงข้อมูล ***
        // MySQL จะคืนค่าเวลามาเป็น UTC, เราต้องบวกกลับเพื่อให้เป็นวันที่ของไทย
        const entryDate = new Date(entry.entry_date);
        const userTimezoneOffset = entryDate.getTimezoneOffset() * 60000;
        const localDate = new Date(entryDate.getTime() + userTimezoneOffset);

        if (localDate.getMonth() === currentMonth && localDate.getFullYear() === currentYear) {
            const day = localDate.getDate();
            entriesObject[day] = { text: entry.text_content, mood: entry.mood };
        }
      });
      setEntries(entriesObject);
    } catch (error) {
      console.error("Failed to fetch calendar entries:", error);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [userId, currentMonth, currentYear]);

  const handleSave = async () => {
    if (!text.trim() || !selectedDay || !userId) return;

    const mood = await mockAnalyzeMoodAPI(text);
    
    // --- จุดที่แก้ไข ---
    // สร้างวันที่โดยไม่สนใจเวลาและโซนเวลา เพื่อให้ได้วันที่ที่ถูกต้องเสมอ
    const year = currentYear;
    const month = (currentMonth + 1).toString().padStart(2, '0'); // เดือนต้อง +1 และมีเลข 2 หลัก
    const day = selectedDay.toString().padStart(2, '0'); // วันที่ต้องมีเลข 2 หลัก
    const dateString = `${year}-${month}-${day}`; // ผลลัพธ์: "2025-08-02"

    const entryData = {
      userId: userId,
      date: dateString,
      text: text,
      mood: mood,
    };

    try {
      await saveCalendarEntry(entryData);
      setEntries(prevEntries => ({
        ...prevEntries,
        [selectedDay]: { text, mood }
      }));
      setText('');
      setSelectedDay(null);
    } catch (error) {
      console.error("Failed to save entry:", error);
      alert("ไม่สามารถบันทึกข้อมูลได้");
    }
  };
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="calendar-page">
      <h2>สวัสดี, {username}!</h2>
      <h3>{new Date(currentYear, currentMonth).toLocaleString('th-TH', { month: 'long', year: 'numeric' })}</h3>
      <div className="calendar">
        {days.map((day) => (
          <div
            key={day}
            className="day"
            onClick={() => {
                setSelectedDay(day);
                setText(entries[day]?.text || '');
            }}
            style={{ backgroundColor: entries[day]?.mood ? moodColors[entries[day].mood] : '#fff' }}
          >
            {day}
          </div>
        ))}
      </div>
      {selectedDay && (
        <div className="entry-box">
          <h3>บันทึกสำหรับวันที่ {selectedDay}</h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="วันนี้เป็นอย่างไรบ้าง..."
          ></textarea>
          <button onClick={handleSave}>บันทึกอารมณ์</button>
        </div>
      )}
    </div>
  );
}

export default CalendarPage;
