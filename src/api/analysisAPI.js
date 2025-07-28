// src/api/analysisAPI.js

// นี่คือ API จำลองของเรานะน้อง
// ในอนาคต เราจะเปลี่ยนเนื้อหาในไฟล์นี้เพื่อเรียกใช้ AI ของจริงจากรุ่นพี่
// โดยที่หน้าบ้าน (Frontend) ไม่ต้องแก้โค้ดเลย!

export const mockAnalyzeMoodAPI = async (text) => {
  console.log("Analyzing text:", text);
  const lowerText = text.toLowerCase();

  // ลองทำให้น้ำหนักของอารมณ์ซับซ้อนขึ้น
  let emotions = {
    happy: 0,
    sad: 0,
    angry: 0,
    anxious: 0,
    neutral: 5 // ให้มีค่าเริ่มต้นเล็กน้อย
  };

  if (lowerText.includes('มีความสุข') || lowerText.includes('สนุก') || lowerText.includes('ดีใจ')) {
    emotions.happy += 50;
  }
  if (lowerText.includes('เศร้า') || lowerText.includes('เสียใจ') || lowerText.includes('ร้องไห้')) {
    emotions.sad += 50;
  }
  if (lowerText.includes('โกรธ') || lowerText.includes('โมโห') || lowerText.includes('หงุดหงิด')) {
    emotions.angry += 50;
  }
  if (lowerText.includes('กังวล') || lowerText.includes('กดดัน')) {
    emotions.anxious += 40;
  }
  if (lowerText.includes('เหนื่อย')) {
    emotions.sad += 20;
    emotions.anxious += 10;
  }

  // หาอารมณ์ที่มีคะแนนสูงสุด
  const primaryEmotion = Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b);

  // ถ้าไม่มีอารมณ์เด่นชัด ให้เป็น neutral
  if (emotions[primaryEmotion] <= 5) {
     return { primary: 'neutral', breakdown: { neutral: 100 } };
  }


  console.log("Analysis result:", { primary: primaryEmotion, breakdown: emotions });
  return { primary: primaryEmotion, breakdown: emotions };
};