// /frontend/src/services/timeCapsuleService.js

const API_URL = 'http://localhost:4000/api';

/**
 * ดึงแคปซูลทั้งหมดของ user คนเดียว
 * @param {number} userId - ID ของผู้ใช้
 * @returns {Promise<Array>} - Array ของแคปซูล
 */
export const getCapsulesByUserId = async (userId) => {
  if (!userId) return [];
  const response = await fetch(`${API_URL}/users/${userId}/capsules`);
  if (!response.ok) {
    throw new Error('Failed to fetch capsules');
  }
  return await response.json();
};

/**
 * สร้างแคปซูลใหม่
 * @param {object} capsuleData - ข้อมูลแคปซูลที่จะสร้าง
 * @returns {Promise<object>} - ข้อความยืนยันจาก server
 */
export const createCapsule = async (capsuleData) => {
  const response = await fetch(`${API_URL}/capsules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(capsuleData),
  });
  if (!response.ok) {
    throw new Error('Failed to create capsule');
  }
  return await response.json();
};
