import React from "react";
import "./Appraisement.css";

const appraisementData = [
  {
    title: "ประเมินตัวเอง",
    description: ["ตรวจสุขภาพใจให้กับตัวเอง", "ประเมินทั่วไป"],
    url: "https://checkin.dmh.go.th/main/index.php?type=1",
    className: "box red",
  },
  {
    title: "แบบทดสอบบุคลิกภาพ",
    description: ["ตรวจสุขภาพใจให้กับผู้อื่น", "ประเมินทั่วไป"],
    url: "https://www.16personalities.com/th",
    className: "box purple",
  },
  {
    title: "แบบทดสอบภาวะซึมเศร้า",
    description: ["ตรวจสุขภาพใจให้กับบุคคลากรกระทรวงสาธารณสุข"],
    url: "https://www.rama.mahidol.ac.th/th/depression_risk",
    className: "box green",
  },
  {
    title: "ประเมินความเครียด",
    description: [
      "ตรวจสุขภาพใจให้กับเด็ก",
      "ตรวจสุขภาพใจให้กับวัยรุ่น",
      "ผู้ที่มีอายุต่ำกว่า 18 ปี",
    ],
    url: "https://www.thaimentalhealth.com/%E0%B8%AA%E0%B9%81%E0%B8%81%E0%B8%99%E0%B9%83%E0%B8%88/%E0%B9%81%E0%B8%9A%E0%B8%9A%E0%B8%9B%E0%B8%A3%E0%B8%B0%E0%B9%80%E0%B8%A1%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B8%A7%E0%B8%B2%E0%B8%A1%E0%B9%80%E0%B8%84%E0%B8%A3%E0%B8%B5%E0%B8%A2%E0%B8%94.html",
    className: "box blue",
  },
];

const Appraisement = () => {
  return (
    <div className="appraisement-page">
      <h1 className="appraisement-heading">แบบทดสอบตัวเอง</h1>
      <div className="appraisement-container">
        {appraisementData.map((item, index) => (
          <div
            className={item.className}
            key={index}
            onClick={() => window.open(item.url, "_blank")}
          >
            <h3>{item.title}</h3>
            <ul>
              {item.description.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
            <p className="link">#เริ่มทำแบบประเมิน</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Appraisement;
