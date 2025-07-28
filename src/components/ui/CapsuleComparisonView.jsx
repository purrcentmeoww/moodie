// src/components/ui/CapsuleComparisonView.jsx
import React, { useState } from 'react';
import { mockAnalyzeMoodAPI } from '../../api/analysisAPI';
import EmotionWheel from './EmotionWheel';
import './CapsuleComparisonView.css';

function CapsuleComparisonView({ capsule, onBack }) {
  const [currentText, setCurrentText] = useState('');
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyzeCurrent = async () => {
    if (!currentText.trim()) return;
    setIsLoading(true);
    const result = await mockAnalyzeMoodAPI(currentText);
    setCurrentAnalysis(result);
    setIsLoading(false);
  };

  return (
    <div className="comparison-container">
      <button onClick={onBack} className="back-button">← กลับไปหน้ารวม</button>
      <h1>เปรียบเทียบอารมณ์ของคุณ</h1>
      <div className="comparison-grid">
        {/* คอลัมน์อดีต */}
        <div className="comparison-card">
          <h2>อดีต ({new Date(capsule.createdAt).toLocaleDateString('th-TH')})</h2>
          <div className="text-box past-text">"{capsule.text}"</div>
          <EmotionWheel data={capsule.pastAnalysis.breakdown} />
        </div>

        {/* คอลัมน์ปัจจุบัน */}
        <div className="comparison-card">
          <h2>ปัจจุบัน</h2>
          <textarea
            placeholder="ตอนนี้รู้สึกอย่างไรบ้าง?"
            rows="5"
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
          />
          <button onClick={handleAnalyzeCurrent} disabled={isLoading}>
            {isLoading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์อารมณ์ปัจจุบัน'}
          </button>
          {currentAnalysis && <EmotionWheel data={currentAnalysis.breakdown} />}
        </div>
      </div>
    </div>
  );
}

export default CapsuleComparisonView;