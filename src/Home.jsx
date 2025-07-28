import React, { useState } from 'react';

function Home({ onSubmit }) {
  const [name, setName] = useState('');

  const handleClick = () => {
    if (name.trim()) {
      onSubmit(name);
    }
  };

  return (
    <div className="home">
      <h1>ยินดีต้อนรับสู่ Mood Tracker</h1>
      <input
        type="text"
        placeholder="ป้อนชื่อของคุณ"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleClick}>เริ่มต้น</button>
    </div>
  );
}

export default Home;
