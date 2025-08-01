// src/pages/HomePage.jsx
import React, { useState } from 'react';
import { mockAnalyzeMoodAPI } from '../api/analysisAPI';
import EmotionWheel from '../components/ui/EmotionWheel';
import './HomePage.css';

function HomePage() {
  const [text, setText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyzeClick = async () => {
    if (!text.trim()) {
      alert('กรุณาพิมพ์ข้อความก่อนนะ!');
      return;
    }
    
    setIsLoading(true);
    setAnalysisResult(null); // ล้างผลลัพธ์เก่าก่อน
    
    // จำลองการรอ 1.5 วินาทีเพื่อให้เห็น Loading...
    setTimeout(async () => {
      const result = await mockAnalyzeMoodAPI(text);
      setAnalysisResult(result);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="homepage-container">
      <h1>วันนี้รู้สึกอย่างไร?</h1>
      <p>ระบายความรู้สึกของคุณออกมา แล้วให้ AI ของเราช่วยรับฟัง</p>

      <textarea
        className="text-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="เล่าเรื่องราวของคุณที่นี่..."
        rows="8"
      />

      <button 
        className="analyze-button" 
        onClick={handleAnalyzeClick}
        disabled={isLoading}
      >
        {isLoading ? 'กำลังวิเคราะห์...' : 'ส่งความรู้สึก'}
      </button>

      {/* ส่วนแสดงผลลัพธ์ */}
      {isLoading && <div className="loading-spinner"></div>}

      {analysisResult && !isLoading && (
        <div className="results-container">
          <h2>ผลการวิเคราะห์</h2>
          <p className="primary-emotion">
            อารมณ์หลักของคุณคือ: <span>{analysisResult.primary}</span>
          </p>
          <EmotionWheel data={analysisResult.breakdown} />
        </div>
      )}
    </div>
  );
}

export default HomePage;