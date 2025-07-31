// src/components/Home.jsx
import React, { useState } from "react";
import "./Home.css";
import SplitText from "../components/ui/Welcome";


function Home({ onSubmit }) {
  const [name, setName] = useState("");

  const handleClick = () => {
    if (name.trim()) {
      onSubmit(name);
    }
  };
  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
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
        />
        <button className="submit-button" onClick={handleClick}>
          Submit
        </button>
      </div>
    </div>
  );
}

export default Home;
