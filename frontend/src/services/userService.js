// /frontend/src/services/userService.js

const API_URL = "http://localhost:4000/api";

/**
 * ฟังก์ชันสำหรับล็อกอิน (แบบ Find or Create)
 * @param {string} username - ชื่อที่ผู้ใช้กรอกเข้ามา
 * @returns {Promise<object>} - ข้อมูล user ที่ได้จาก DB (มี id และ username)
 */
export const loginUser = async (username) => {
  const response = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: username }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to login or create user");
  }

  return await response.json();
};
