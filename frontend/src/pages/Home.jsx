// /frontend/src/pages/Home.jsx
import React, { useState } from "react";
import "./Home.css";
import SplitText from "../components/ui/Welcome";
import { loginUser } from "../services/userService"; // 1. Import service ของเรา

function Home({ onSubmit }) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 2. แก้ไข handleClick ให้เรียก API
  const handleClick = async () => {
    if (!name.trim()) {
      alert("กรุณาป้อนชื่อของคุณ");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const userData = await loginUser(name.trim());
      // 3. เมื่อสำเร็จ, ส่งข้อมูล user ทั้งหมด (ที่มี id) กลับไปให้ App.jsx
      onSubmit(userData);
    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="background-image"></div>
      <div className="home-content">
        <h2>
          <SplitText
            text="We’re here to support you —"
            delay={100}
            duration={0.6}
            splitType="words"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
          />
        </h2>
        <p>what name should we use to walk this journey with you?</p>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          onKeyPress={(event) => {
            if (event.key === 'Enter') {
              handleClick();
            }
          }}
        />
        <button className="submit-button" onClick={handleClick} disabled={isLoading}>
          {isLoading ? "กำลังโหลด..." : "Submit"}
        </button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </div>
    </div>
  );
}

export default Home;
