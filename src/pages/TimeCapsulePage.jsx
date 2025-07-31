// src/pages/TimeCapsulePage.jsx
import React, { useState, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { th } from "date-fns/locale/th";
import "react-datepicker/dist/react-datepicker.css";
import "./TimeCapsulePage.css";
import { mockAnalyzeMoodAPI } from "../api/analysisAPI";
import CapsuleComparisonView from "../components/ui/CapsuleComparisonView";

registerLocale("th", th);

const CAPSULES_STORAGE_KEY = "emotion-time-capsules";

function TimeCapsulePage() {
  const [text, setText] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [pendingCapsules, setPendingCapsules] = useState([]);
  const [openedCapsules, setOpenedCapsules] = useState([]);
  const [viewingCapsule, setViewingCapsule] = useState(null);

  useEffect(() => {
    const storedCapsules =
      JSON.parse(localStorage.getItem(CAPSULES_STORAGE_KEY)) || [];
    const now = new Date();
    const stillPending = [];
    const justOpened = [];

    storedCapsules.forEach((capsule) => {
      if (new Date(capsule.openDate) <= now) {
        justOpened.push(capsule);
      } else {
        stillPending.push(capsule);
      }
    });

    if (justOpened.length > 0) {
      setOpenedCapsules((prevOpened) =>
        [...prevOpened, ...justOpened].sort(
          (a, b) => new Date(b.openDate) - new Date(a.openDate)
        )
      );
    }
    setPendingCapsules(stillPending);

    localStorage.setItem(CAPSULES_STORAGE_KEY, JSON.stringify(stillPending));
  }, []);

  useEffect(() => {
    const checkAndOpenCapsules = () => {
      const storedCapsules =
        JSON.parse(localStorage.getItem(CAPSULES_STORAGE_KEY)) || [];
      const now = new Date();
      const stillPending = [];
      const justOpened = [];

      storedCapsules.forEach((capsule) => {
        if (new Date(capsule.openDate) <= now) {
          justOpened.push(capsule);
        } else {
          stillPending.push(capsule);
        }
      });

      if (justOpened.length > 0) {
        setOpenedCapsules((prevOpened) =>
          [...prevOpened, ...justOpened].sort(
            (a, b) => new Date(b.openDate) - new Date(a.openDate)
          )
        );
        setPendingCapsules(stillPending);
        localStorage.setItem(CAPSULES_STORAGE_KEY, JSON.stringify(stillPending));
      }
    };

    checkAndOpenCapsules();
    const interval = setInterval(checkAndOpenCapsules, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSealCapsule = async () => {
    if (!text.trim()) {
      alert("อย่าลืมเขียนข้อความถึงตัวเองในอนาคตนะ!");
      return;
    }
    if (!selectedDate) {
      alert("กรุณาเลือกวันที่จะเปิดแคปซูลด้วยนะ!");
      return;
    }

    const analysis = await mockAnalyzeMoodAPI(text);
    const newCapsule = {
      id: new Date().getTime(),
      text: text,
      createdAt: new Date().toISOString(),
      openDate: selectedDate.toISOString(),
      pastAnalysis: analysis,
    };

    const updatedPendingCapsules = [...pendingCapsules, newCapsule];
    setPendingCapsules(updatedPendingCapsules);
    localStorage.setItem(
      CAPSULES_STORAGE_KEY,
      JSON.stringify(updatedPendingCapsules)
    );

    alert(
      `แคปซูลของคุณถูกผนึกแล้ว! เจอกันวันที่ ${selectedDate.toLocaleDateString(
        "th-TH",
        { year: "numeric", month: "long", day: "numeric" }
      )}`
    );

    setText("");
    setSelectedDate(null);
  };

  const handleTestSeal = async () => {
    if (!text.trim()) {
      alert("กรุณาพิมพ์ข้อความสำหรับทดสอบก่อนนะ!");
      return;
    }

    const analysis = await mockAnalyzeMoodAPI(text);
    const now = new Date();
    const openDate = new Date(now.getTime() + 1 * 60 * 1000);

    const newCapsule = {
      id: now.getTime(),
      text: text,
      createdAt: now.toISOString(),
      openDate: openDate.toISOString(),
      pastAnalysis: analysis,
    };

    const updatedPendingCapsules = [...pendingCapsules, newCapsule];
    setPendingCapsules(updatedPendingCapsules);
    localStorage.setItem(
      CAPSULES_STORAGE_KEY,
      JSON.stringify(updatedPendingCapsules)
    );

    alert(`แคปซูลทดสอบถูกผนึกแล้ว! จะเปิดในอีก 1 นาที`);
    setText("");
    setSelectedDate(null);
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (viewingCapsule) {
    return (
      <CapsuleComparisonView
        capsule={viewingCapsule}
        onBack={() => setViewingCapsule(null)}
      />
    );
  }

  return (
    <div className="time-capsule-container" style={{ overflowY: "auto", maxHeight: "100vh" }}>
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
        {openedCapsules.length === 0 ? (
          <p>(ยังไม่มีแคปซูลที่เปิด...)</p>
        ) : (
          <div className="capsule-list">
            {openedCapsules.map((capsule) => (
              <div key={capsule.id} className="capsule-card">
                <p className="capsule-text">"{capsule.text}"</p>
                <div className="card-footer">
                  <small className="capsule-date">
                    เขียนเมื่อ: {" "}
                    {new Date(capsule.createdAt).toLocaleDateString("th-TH")}
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
