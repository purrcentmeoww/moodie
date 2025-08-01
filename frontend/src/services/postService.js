// /frontend/src/services/postService.js

const API_URL = "http://localhost:4000/api"; // URL ของ Back-end เรา

// ฟังก์ชันสำหรับดึงโพสต์ทั้งหมด
export const getPosts = async () => {
  const response = await fetch(`${API_URL}/posts`);
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  return await response.json();
};

// ฟังก์ชันสำหรับสร้างโพสต์ใหม่
// **แก้ไข** ให้รับ userId มาด้วย
export const createPost = async (text, userId) => {
  const response = await fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // ส่งทั้ง text และ userId
    body: JSON.stringify({ text: text, userId: userId }),
  });
  if (!response.ok) throw new Error('Failed to create post');
  return await response.json();
};

// (ฟังก์ชันอื่นๆ เช่น getComments, createComment ก็ควรจะเพิ่ม userId เข้าไปในอนาคต)

// /frontend/src/services/postService.js

// ... (ฟังก์ชัน getPosts, createPost เหมือนเดิม) ...

// ฟังก์ชันสำหรับดึงคอมเมนต์ของโพสต์
export const getComments = async (postId) => {
  const response = await fetch(`${API_URL}/posts/${postId}/comments`);
  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }
  return await response.json();
};

// ฟังก์ชันสำหรับสร้างคอมเมนต์ใหม่
export const createComment = async (postId, text) => {
  const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: text }),
  });
  if (!response.ok) {
    throw new Error("Failed to create comment");
  }
  return await response.json();
};

// ฟังก์ชันสำหรับลบโพสต์
export const deletePost = async (postId) => {
  const response = await fetch(`${API_URL}/posts/${postId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete post");
  }
  return await response.json();
};

// ฟังก์ชันสำหรับลบคอมเมนต์
export const deleteComment = async (commentId) => {
  const response = await fetch(`${API_URL}/comments/${commentId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete comment");
  }
  return await response.json();
};

