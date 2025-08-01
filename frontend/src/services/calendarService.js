// /frontend/src/services/calendarService.js
const API_URL = 'http://localhost:4000/api';

export const getCalendarEntries = async (userId) => {
  if (!userId) return [];
  const response = await fetch(`${API_URL}/users/${userId}/calendar-entries`);
  if (!response.ok) throw new Error('Failed to fetch entries');
  return await response.json();
};

export const saveCalendarEntry = async (entryData) => {
  // --- กับดักที่ 2 ---
  console.log('[Service] กำลังส่งข้อมูลนี้ไปที่ Back-end:', entryData);
  // --------------------

  const response = await fetch(`${API_URL}/calendar-entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entryData),
  });

  if (!response.ok) {
    // พิมพ์ Error ที่ได้จาก Back-end ออกมาดูด้วย
    const errorBody = await response.text();
    console.error('[Service] Back-end ตอบกลับมาว่ามีปัญหา:', errorBody);
    throw new Error('Failed to save entry');
  }
  return await response.json();
};
