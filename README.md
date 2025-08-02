# Moodie App API Documentation (สมบูรณ์ทุกรายละเอียด)

> **อัปเดตล่าสุด:** 2 สิงหาคม 2568  
> หมายเหตุ: README ฉบับนี้เน้นความเข้าใจง่าย ขยายความจุดสำคัญ โชว์ตัวอย่างการใช้งานทุก endpoint พร้อมอธิบายลึกถึง data flow และหลักการออกแบบ

---

## 🔖 Contents

- [สรุปแนวคิดสำคัญและภาพรวมระบบ](#summary)
- [Base URL](#base-url)
- [มาตรฐาน Error & Status Code](#errors)
- [User / Authentication API](#user-api)
- [Empathy Wall API](#empathy-wall-api)
    - [Posts](#post-api)
    - [Comments](#comment-api)
- [Time Capsule API](#capsule-api)
- [Calendar API](#calendar-api)
- [คำแนะนำ/แนวปฏิบัติสำหรับการเชื่อมต่อ](#advice)
---

<a name="summary"></a>
## 📍 สรุปแนวคิดสำคัญและภาพรวมระบบ

- **Backend:** Node.js (Express.js)
- **Database:** MySQL (รันบน Docker)
- **Data Format:** JSON ตลอดทั้งระบบ
- **Communication:** RESTful (GET, POST, DELETE)
- **Authentication:** ระบุเฉพาะ username และ userId (จำลองแนวคิดง่าย ใช้งานจริงควรเสริม Auth Token เพิ่มเติม)
- **Use Case:** ระบบจัดการ community ร่วมรู้สึก (Empathy Wall), Time Capsule ส่วนตัว, ปฏิทินอารมณ์ (Calendar Entry) เหมาะกับแอปช่วยดูแลใจ, ให้คำปรึกษา หรือจิตวิทยา

---

<a name="base-url"></a>
## 🌐 Base URL (รันบน localhost)

http://localhost:4000/  


---

<a name="errors"></a>
## 🚦 มาตรฐาน Error & Status Code

| Code         | อธิบายความหมาย                  | ตัวอย่างความผิดพลาด                   |
|--------------|-----------------------------|--------------------------------------|
| 200 OK       | สำเร็จ (โดยทั่วไปสำหรับ GET/DELETE) | -                                    |
| 201 Created  | สร้างข้อมูลใหม่สำเร็จ (POST)     | POST ประสบความสำเร็จ                |
| 400 Bad Request | ส่งข้อมูลไม่ครบหรือผิดรูปแบบ    | ขาดพารามิเตอร์ userId, username ว่าง  |
| 403 Forbidden | ไม่มีสิทธิ์กระทำการ             | ลบโพสต์/คอมเมนต์ของผู้อื่น           |
| 404 Not Found | ไม่พบข้อมูลที่ต้องการ           | postId/commentId ไม่มีในระบบ         |
| 500 Internal Server Error | มีข้อผิดพลาดที่ฝั่ง backend | -                                    |

---

<a name="user-api"></a>
## 👤 User API — สร้าง/เข้าสู่ระบบ

> สร้าง user อัตโนมัติเมื่อยังไม่มี หรือ ดึงข้อมูลกลับมาเมื่อมี user อยู่แล้ว

**Endpoint:**  
`POST /api/users/login`

### Request

{
"username": "Somsak"
}

- ใช้ username เดียวกับที่ต้องการล็อกอิน (unique ในระบบ)
- ไม่มี password (demo purpose!)

### Response

- **ถ้า user เก่าเจอในระบบ**:  
    `200 OK`
    ```
    {
      "id": 1,
      "username": "Somsak",
      "created_at": "2025-08-02T10:00:00.000Z"
    }
    ```
- **ถ้าเป็น user ที่สร้างใหม่**:  
    `201 Created`
    ```
    {
      "id": 5,
      "username": "Somsak",
      "created_at": "2025-08-02T14:00:00.000Z"
    }
    ```
- **ถ้า username ว่าง**  
    `400 Bad Request`
    ```
    { "error": "Username is required" }
    ```

### Data Flow (ลึก)
- รับ `username` → เช็คใน db →  
    - ถ้ามี user ส่งกลับ user info (พร้อม log USER_LOGIN)
    - ถ้าไม่เจอ สร้าง user ใหม่ → ส่ง info (และ log USER_REGISTER)
- นำ user id ที่ได้ (เช่น 1) ไปใช้กับ endpoint อื่นต่อ

---

<a name="empathy-wall-api"></a>
## 🧡 Empathy Wall API

<a name="post-api"></a>
### 1.1 ดึงข้อมูลโพสต์ทั้งหมด (GET)

**Endpoint:**  
`GET /api/posts`

- ไม่ต้องมีพารามิเตอร์

**Response:**
[
{
"id": 15,
"user_id": 2,
"text_content": "ทดสอบการโพสต์",
"hearts": 0,
"created_at": "2025-08-02T10:30:00.000Z",
"username": "Suda",
"comment_count": 5
}
]

**เบื้องหลัง:**  
ระบบดึงโพสต์ + join username จาก user + subquery นับ comment อัตโนมัติ  
**ใช้สำหรับโชว์ไทม์ไลน์/หน้า feed หลัก**

---

### 1.2 สร้างโพสต์ใหม่ (POST)

**Endpoint:**  
`POST /api/posts`

**Request**
{
"text": "รู้สึกมีความสุขมากวันนี้!",
"userId": 1
}

- `text`: เนื้อหาโพสต์, `userId`: id user ที่ได้จาก /login

**Response** (สำเร็จ)  
`201 Created`
{
"message": "Post created!",
"postId": 16
}

**เงื่อนไขสำคัญ**  
- ข้อมูลไม่ครบ → `400 Bad Request`
- สร้างเสร็จส่ง `postId` กลับสำหรับอ้างอิงต่อไป

---

### 1.3 ลบโพสต์ (DELETE)

**Endpoint:**  
`DELETE /api/posts/:postId`
- `:postId` = id ของโพสต์ใน url
- **ต้องส่งใน body**:  
{ "userId": 1 }

**Response:**
- `200 OK` (ถ้าสำเร็จ)
- `403 Forbidden` (ไม่ใช่เจ้าของ)
- `404 Not Found` (ไม่มีโพสต์นี้)
- `400 Bad Request` (ขาด userId)

---

<a name="comment-api"></a>
### 2.1 ดึงคอมเมนต์ในโพสต์ (GET)

**Endpoint:**  
`GET /api/posts/:postId/comments`
- `:postId` ใส่ใน URL

**Response:**  
[
{
"id": 101,
"post_id": 15,
"text_content": "สู้ๆนะ",
"created_at": "2025-08-02T10:31:00.000Z",
"user_id": 1,
"username": "Somsak"
}
]


---

### 2.2 สร้างคอมเมนต์ในโพสต์ (POST)

**Endpoint:**  
`POST /api/posts/:postId/comments`

**Request**
{
"text": "เห็นด้วยเลยครับ!",
"userId": 2
}

**Response:**  
`201 Created`
{
"message": "Comment created!",
"commentId": 103
}

**ขาดค่าใดค่านึง error**

---

### 2.3 ลบคอมเมนต์ (DELETE)

**Endpoint:**  
`DELETE /api/comments/:commentId`

**Request**
{
"userId": 2
}

**Response:**  
`200 OK`
{ "message": "Comment deleted successfully" }

*ต้องเป็นเจ้าของคอมเมนต์เท่านั้น, ระบบจะตรวจสอบ userId เทียบกับเจ้าของจริง*

---

<a name="capsule-api"></a>
## ✉️ Time Capsule API

### 3.1 ดึงแคปซูลทั้งหมดของผู้ใช้ (GET)

**Endpoint:**  
`GET /api/users/:userId/capsules`

**Response:**
[
{
"id": 1,
"user_id": 1,
"text_content": "ถึงตัวฉันในอนาคต...",
"past_analysis": "{"primary":"happy","breakdown":{}}",
"open_date": "2026-08-02T00:00:00.000Z",
"created_at": "2025-08-02T10:15:00.000Z"
}
]

**ใช้กับหน้าดู time capsule ทั้งหมดของตนเอง**

---

### 3.2 สร้างแคปซูลใหม่ (POST)

**Endpoint:**  
`POST /api/capsules`

**Request**
{
"userId": 1,
"text": "หวังว่าตอนนั้นจะสบายดีนะ",
"openDate": "2026-08-02T10:20:00.000Z",
"pastAnalysis": {
"primary": "hopeful",
"breakdown": { "hopeful": 0.9, "neutral": 0.1 }
}
}

- `openDate` format: ISO (UTC)

**Response:**  
`201 Created`
{
"message": "Time capsule created!",
"capsuleId": 2
}

---

<a name="calendar-api"></a>
## 📅 Calendar API (Diary/Mood Log)

### 4.1 ดึง diary ทั้งหมด (GET)

**Endpoint:**  
`GET /api/users/:userId/calendar-entries`

**Response:**
[
{
"id": 1,
"user_id": 2,
"entry_date": "2024-06-20",
"text_content": "วันที่ดีมาก!",
"mood": "happy",
"created_at": "2024-06-20T12:35:00.000Z"
}
]

---

### 4.2 สร้าง/อัปเดต diary (POST)

**Endpoint:**  
`POST /api/calendar-entries`

**Request**
{
"userId": 2,
"date": "2024-07-01",
"text": "รู้สึกเศร้านิดหน่อย",
"mood": "sad"
}

- วันหนึ่งมีได้ 1 entry/user (ระบบจะ update ถ้าเจอวันเดียวกันอยู่แล้ว)

**Response:**  
`200 OK`
{ "message": "Entry saved successfully" }


---

<a name="advice"></a>
## ℹ️ คำแนะนำระบบ พารามิเตอร์ และ Data Flow

- **userId**: Handshake รับมาจาก `/api/users/login` ทุกการ call ที่แก้ไข/สร้าง/ลบข้อมูล ต้องส่ง userId เพื่อระบุตัวตน
- **postId, commentId, capsuleId, etc.**: รับจากการเลือก/คลิกในแอป, web ส่งค่าพวกนี้ในการเรียก endpoint เพิ่ม/ลบ/ดูข้อมูล
- **การส่งค่าผ่าน body**: POST/DELETE ส่วนใหญ่จะใช้ JSON ใน body อย่าลืม set header `Content-Type: application/json`
- **ระบบ Auth**: ตัวอย่างนี้ยึดบาง endpoint ให้ส่ง userId แบบ plain text! ใน Production Stack ควรมี JWT หรือ Auth Token ที่ปลอดภัยเสมอ

---

## 💡 สรุป Workflow แนะนำ (เชื่อมโยงแต่ละ API)

1. Login (หรือสมัคร) → `/api/users/login`
2. ดึง post timeline → `/api/posts`  
   สร้าง post → `/api/posts`
   ลบ post → `/api/posts/:postId` (body: userId)
3. comment post → `/api/posts/:postId/comments`
   ลบ comment → `/api/comments/:commentId`
4. สร้าง capsule → `/api/capsules`
   ดู capsule → `/api/users/:userId/capsules`
5. จด diary/mood → `/api/calendar-entries`
   ดูประวัติ diary/mood → `/api/users/:userId/calendar-entries`

---

## 🎯 Tips - การใช้งาน/แก้ปัญหา

- ทุก endpoint ตรวจสอบ parameter อย่างละเอียด หากขาดค่าคุณจะได้รับ error 400/403/404 พร้อมข้อความระบุปัญหาชัดเจน
- format ข้อมูลวันและเวลา (Date-Times) ใช้ ISO 8601 เสมอ (แนะนำ moment.js หรือ dayjs สำหรับ front-end)
- ดูตัวอย่าง Response/Request ด้านบนเพื่อใช้อ้างอิง  
- รายละเอียด error จะอยู่ใน field `"error"` ของ response

---
