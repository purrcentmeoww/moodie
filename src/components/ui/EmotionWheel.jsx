// src/components/ui/EmotionWheel.jsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './EmotionWheel.css';

// กำหนดสีสำหรับแต่ละอารมณ์
const EMOTION_COLORS = {
  happy: '#FFD700',    // Gold
  sad: '#87CEFA',       // LightSkyBlue
  angry: '#FF6347',    // Tomato
  anxious: '#9370DB',  // MediumPurple
  neutral: '#D3D3D3',  // LightGray
  love: '#FFC0CB',      // Pink
};

function EmotionWheel({ data }) {
  if (!data) return null;

  // 1. แปลง Object ข้อมูลของเราให้เป็น Array ที่ Recharts ใช้งานได้
  const chartData = Object.entries(data)
    .filter(([, value]) => value > 0) // กรองเอาเฉพาะอารมณ์ที่มีค่า
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })); // ทำให้ key เป็นตัวพิมพ์ใหญ่ตัวแรก

  return (
    <div className="emotion-wheel-wrapper">
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          {/* ส่วนของวงกลม */}
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {/* 2. วนลูปสร้าง <Cell> เพื่อใส่สีให้แต่ละชิ้นของวงกลม */}
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.name.toLowerCase()] || '#8884d8'} />
            ))}
          </Pie>

          {/* 3. Tooltip เอาไว้แสดงข้อมูลเวลาเอาเมาส์ไปชี้ */}
          <Tooltip />

          {/* 4. Legend คือคำอธิบายสีด้านล่าง */}
          <Legend />

        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EmotionWheel;