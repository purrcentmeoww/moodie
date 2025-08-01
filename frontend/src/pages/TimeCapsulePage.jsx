// /frontend/src/pages/TimeCapsulePage.jsx
import React, { useState, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { th } from "date-fns/locale/th";
import "react-datepicker/dist/react-datepicker.css";
import "./TimeCapsulePage.css";

// --- Imports ที่ถูกต้อง ---
import {
  getCapsulesByUserId,
  createCapsule,
} from "../services/timeCapsuleService";
import { mockAnalyzeMoodAPI } from "../api/analysisAPI";
import CapsuleComparisonView from "../components/ui/CapsuleComparisonView";

registerLocale("th", th);

// **สำคัญ:** รับ userId มาจาก App.jsx
function TimeCapsulePage({ userId }) {
  const [text, setText] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [openedCapsules, setOpenedCapsules] = useState([]);
  const [viewingCapsule, setViewingCapsule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- Logic ใหม่: ดึงข้อมูลจาก DB ---
  const fetchAndProcessCapsules = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const allCapsules = await getCapsulesByUserId(userId);

      const now = new Date();
      const opened = [];

      // แยกแคปซูลที่โหลดมาว่าเป็น "เปิดแล้ว" หรือไม่
      allCapsules.forEach((capsule) => {
        if (new Date(capsule.open_date) <= now) {
          opened.push(capsule);
        }
      });

      setOpenedCapsules(
        opened.sort((a, b) => new Date(b.open_date) - new Date(a.open_date))
      );
    } catch (error) {
      console.error("Failed to fetch capsules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect จะทำงานเมื่อ userId พร้อมใช้งาน
  useEffect(() => {
    fetchAndProcessCapsules();
  }, [userId]);

  // --- Logic ใหม่: บันทึกข้อมูลลง DB ---
  const handleSealCapsule = async () => {
    if (!text.trim() || !selectedDate || !userId) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน (ข้อความและวันที่)");
      return;
    }

    const analysis = await mockAnalyzeMoodAPI(text);
    const capsuleData = {
      userId: userId,
      text: text,
      openDate: selectedDate.toISOString(),
      pastAnalysis: analysis,
    };

    try {
      await createCapsule(capsuleData);
      alert(`แคปซูลของคุณถูกผนึกแล้ว!`);
      setText("");
      setSelectedDate(null);
      fetchAndProcessCapsules(); // โหลดข้อมูลใหม่
    } catch (error) {
      console.error("Failed to seal capsule:", error);
    }
  };

  // --- Logic ใหม่: ปุ่มทดสอบที่บันทึกลง DB ---
  const handleTestSeal = async () => {
    if (!text.trim() || !userId) {
      alert("กรุณาพิมพ์ข้อความสำหรับทดสอบก่อนนะ!");
      return;
    }

    const analysis = await mockAnalyzeMoodAPI(text);
    const now = new Date();
    const openDate = new Date(now.getTime() + 1 * 60 * 1000);

    const capsuleData = {
      userId: userId,
      text: text,
      openDate: openDate.toISOString(),
      pastAnalysis: analysis,
    };

    try {
      await createCapsule(capsuleData);
      alert(`แคปซูลทดสอบถูกผนึกแล้ว! จะเปิดในอีก 1 นาที`);
      setText("");
      setSelectedDate(null);
      setTimeout(() => fetchAndProcessCapsules(), 500);
    } catch (error) {
      console.error("Failed to seal test capsule:", error);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (viewingCapsule) {
    const capsuleForViewing = { ...viewingCapsule };

    if (typeof capsuleForViewing.past_analysis === "string") {
      try {
        capsuleForViewing.past_analysis = JSON.parse(
          capsuleForViewing.past_analysis
        );
      } catch (error) {
        capsuleForViewing.past_analysis = { breakdown: {} };
      }
    }

    // แปลงชื่อ field ให้ตรงกับที่ Component คาดหวัง
    capsuleForViewing.text = capsuleForViewing.text_content;
    capsuleForViewing.createdAt = capsuleForViewing.created_at;

    return (
      <CapsuleComparisonView
        capsule={capsuleForViewing}
        onBack={() => setViewingCapsule(null)}
      />
    );
  }

  return (
    <div
      className="time-capsule-container"
      style={{ overflowY: "auto", maxHeight: "100vh" }}
    >
      <h1>สร้างแคปซูลเวลาอารมณ์</h1>
      <p>
        เขียนบันทึกที่นึกถึงคุณค่ามากมายอย่างดีอาจสามารถกลับไปหาคุณเมื่อถึงเวลา
      </p>
      <textarea
        className="capsule-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ถึงตัวฉันเอง..."
        rows="10"
      />
      <div className="controls-container">
        <label>เลือกวันที่จะเปิด:</label>
        <DatePicker
          className="date-picker-input"
          locale="th"
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          minDate={tomorrow}
          dateFormat="dd MMMM yyyy"
          placeholderText="คลิกเพื่อเลือกวันที่"
        />
      </div>
      <div className="button-group">
        <button className="seal-button" onClick={handleSealCapsule}>
          ผนึกแคปซูลเวลา
        </button>
        <button className="test-button" onClick={handleTestSeal}>
          ทดสอบ (1 นาที)
        </button>
      </div>
      <div className="opened-capsules-section">
        <h2>แคปซูลที่เปิดแล้ว</h2>
        {isLoading ? (
          <p>กำลังโหลด...</p>
        ) : openedCapsules.length === 0 ? (
          <p>(ยังไม่มีแคปซูลที่เปิด...)</p>
        ) : (
          <div className="capsule-list">
            {openedCapsules.map((capsule) => (
              <div key={capsule.id} className="capsule-card">
                <p className="capsule-text">"{capsule.text_content}"</p>
                <div className="card-footer">
                  <small className="capsule-date">
                    เขียนเมื่อ:{" "}
                    {new Date(capsule.created_at).toLocaleDateString("th-TH")}
                  </small>
                  <button
                    onClick={() => setViewingCapsule(capsule)}
                    className="compare-button"
                  >
                    เปรียบเทียบอารมณ์
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TimeCapsulePage;
