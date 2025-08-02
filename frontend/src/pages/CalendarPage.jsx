import React, { useState, useEffect } from 'react';
import './CalendarPage.css';
import { getCalendarEntries, saveCalendarEntry } from '../services/calendarService';

// 🔹 วิเคราะห์อารมณ์เพื่อ "สีพื้นหลัง"
const mockAnalyzeMoodAPI = async (text) => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('ดี') || lowerText.includes('สุข') || lowerText.includes('สนุก')) return 'happy';
  if (lowerText.includes('เศร้า') || lowerText.includes('ร้องไห้')) return 'sad';
  if (lowerText.includes('โมโห') || lowerText.includes('โกรธ')) return 'angry';
  return 'neutral';
};

// 🔹 วิเคราะห์อารมณ์เพื่อ "อิโมจิ"
const analyzeMoodFromEmoNews = async (text) => {
  try {
    const response = await fetch(`https://api.aiforthai.in.th/emonews/prediction?text=${encodeURIComponent(text)}`, {
      method: 'GET',
      headers: {
        'Apikey': '8TBRAeVIBte0eOgiDLCvuaeldsIgoMbP'
      }
    });

    const data = await response.json();
    if (data.status === 'success') {
      const result = data.result;
      const topMood = Object.entries(result).reduce((max, curr) => curr[1] > max[1] ? curr : max);
      return topMood[0];
    } else {
      console.error('API error:', data);
      return 'neutral';
    }
  } catch (err) {
    console.error('Fetch failed:', err);
    return 'neutral';
  }
};

// 🔹 สีพื้นหลังตามอารมณ์จาก mock
const moodColors = {
  happy: '#FFD700',
  sad: '#87CEFA',
  angry: '#FF6347',
  neutral: '#D3D3D3'
};

// 🔹 emoji แสดงตาม EmoNews API
const moodEmoji = {
  surprise: '😲',
  neutral: '😐',
  sadness: '😢',
  pleasant: '😊',
  fear: '😨',
  anger: '😠',
  joy: '😄'
};

function CalendarPage({ username, userId }) {
  const [entries, setEntries] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [text, setText] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const today = new Date();
  const isToday = (day) =>
    today.getDate() === day &&
    today.getMonth() === currentMonth &&
    today.getFullYear() === currentYear;

  const fetchEntries = async () => {
    if (!userId) return;
    try {
      const dataFromApi = await getCalendarEntries(userId);
      const entriesObject = {};
      dataFromApi.forEach(entry => {
        const entryDate = new Date(entry.entry_date);
        const userTimezoneOffset = entryDate.getTimezoneOffset() * 60000;
        const localDate = new Date(entryDate.getTime() + userTimezoneOffset);

        if (localDate.getMonth() === currentMonth && localDate.getFullYear() === currentYear) {
          const day = localDate.getDate();
          entriesObject[day] = {
            text: entry.text_content,
            moodColor: entry.mood,      // จาก mock
            moodEmoji: entry.mood       // เบื้องต้นใช้ mood เดิมแสดง emoji
          };
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

    const moodColor = await mockAnalyzeMoodAPI(text);
    const moodEmojiResult = await analyzeMoodFromEmoNews(text);

    const year = currentYear;
    const month = (currentMonth + 1).toString().padStart(2, '0');
    const day = selectedDay.toString().padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    const entryData = {
      userId: userId,
      date: dateString,
      text: text,
      mood: moodColor
    };

    try {
      await saveCalendarEntry(entryData);
      setEntries(prevEntries => ({
        ...prevEntries,
        [selectedDay]: {
          text,
          moodColor,
          moodEmoji: moodEmojiResult
        }
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
            className={`day ${isToday(day) ? 'current-day' : ''}`}
            onClick={() => {
              setSelectedDay(day);
              setText(entries[day]?.text || '');
            }}
            style={{
              backgroundColor: entries[day]?.moodColor
                ? moodColors[entries[day].moodColor]
                : '#fff'
            }}
          >
            {day} {entries[day]?.moodEmoji ? moodEmoji[entries[day].moodEmoji] : ''}
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
