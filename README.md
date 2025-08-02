# Moodie App API Documentation (สมบูรณ์ทุกรายละเอียด)


## 🔖 Contents

- [สรุปแนวคิดสำคัญและภาพรวมระบบ](#summary)
- [Base URL](#base-url)
- [User / Authentication API](#user-api)
- [Empathy Wall API](#empathy-wall-api)
    - [Posts](#post-api)
    - [Comments](#comment-api)
- [Time Capsule API](#capsule-api)
- [Calendar API](#calendar-api)
---

<a name="summary"></a>
## 📍 สรุปแนวคิดสำคัญและภาพรวมระบบ
#### พวกเราเห็นถึงความสำคัญของปัญหาสุขภาพจิตจึงมีไอเดียในการพัฒนาแพลตฟอร์มที่ช่วยบันทึกอารมณ์ของผู้ใช้งานผ่านการจดบันทึกประจำวัน เพื่อให้ง่ายต่อการใช้งานของผู้ใช้ ระบบจะบันทึกระดับของอารมณ์ผู้ใช้เอาไว้ เพื่อให้ง่ายต่อการประเมินตนเองในระยะยาว
---
## 🔥 ความท้าทาย
1. ข้อมูลน้อย ไม่มี datasets โดยตรง
2. การทำงานของ Tokenizer กับภาษาไทยนั้นยังทำงานด้วยกันได้ไม่ดี
3. การทำ Fine-tuning เพื่อใช้กับ Downstream task
---
<a name="base-url"></a>
## 🌐 Base URL (รันบน localhost)

http://localhost:4000/  


---

<a name="user-api"></a>
## 👤 User API — สร้าง/เข้าสู่ระบบ

> สร้าง user อัตโนมัติเมื่อยังไม่มี หรือ ดึงข้อมูลกลับมาเมื่อมี user อยู่แล้ว

**Endpoint:**  
`POST /api/users/login`

### Request

```JSON
{
"username": "Somsak"
}
```

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
---

<a name="empathy-wall-api"></a>
## 🧡 Empathy Wall API

<a name="post-api"></a>
### 1.1 ดึงข้อมูลโพสต์ทั้งหมด (GET)

**Endpoint:**  
`GET /api/posts`

- ไม่ต้องมีพารามิเตอร์

**Response:**
``` JSON
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
    ...
]
```

---

### 1.2 สร้างโพสต์ใหม่ (POST)

**Endpoint:**  
`POST /api/posts`

**Request**
``` JSON
{
    "text": "รู้สึกมีความสุขมากวันนี้!",
    "userId": 1
}
```
- `text`: เนื้อหาโพสต์, 
- `userId`: id user ที่ได้จาก /login

**Response** (สำเร็จ)  
`201 Created`
``` JSON
{
    "message": "Post created!",
    "postId": 16
}
``` 
---

### 1.3 ลบโพสต์ (DELETE)

**Endpoint:**  
`DELETE /api/posts/:postId`
``` JSON
{
    "userId": 1
}
```
- `:postId` = id ของโพสต์ใน url
- `userId`: id user 

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
``` JSON
[
    {
        "id": 101,
        "post_id": 15,
        "text_content": "สู้ๆนะ",
        "created_at": "2025-08-02T10:31:00.000Z",
        "user_id": 1,
        "username": "Somsak"
    }
    ...
]
```

---

### 2.2 สร้างคอมเมนต์ในโพสต์ (POST)

**Endpoint:**  
`POST /api/posts/:postId/comments`

**Request**
``` JSON
{
    "text": "เห็นด้วยเลยครับ!",
    "userId": 2
}
``` 

**Response:**  
`201 Created`
``` JSON
{
    "message": "Comment created!",
    "commentId": 103
}
``` 

---

### 2.3 ลบคอมเมนต์ (DELETE)

**Endpoint:**  
`DELETE /api/comments/:commentId`

**Request**
``` JSON
{
"userId": 2
}
```

**Response:**  
`200 OK`
``` JSON
{ 
    "message": "Comment deleted successfully" 
}
```

---

<a name="capsule-api"></a>
## ✉️ Time Capsule API

### 3.1 ดึงแคปซูลทั้งหมดของผู้ใช้ (GET)

**Endpoint:**  
`GET /api/users/:userId/capsules`

**Response:**
``` JSON
[
    {
        "id": 1,
        "user_id": 1,
        "text_content": "ถึงตัวฉันในอนาคต...",
        "past_analysis": "{"primary":"happy","breakdown":{}}",
        "open_date": "2026-08-02T00:00:00.000Z",
        "created_at": "2025-08-02T10:15:00.000Z"
    }
    ...
]
```

---

### 3.2 สร้างแคปซูลใหม่ (POST)

**Endpoint:**  
`POST /api/capsules`

**Request**
``` JSON
{
    "userId": 1,
    "text": "หวังว่าตอนนั้นจะสบายดีนะ",
    "openDate": "2026-08-02T10:20:00.000Z",
    "pastAnalysis": {
        "primary": "hopeful",
        "breakdown": { 
            "hopeful": 0.9, 
            "neutral": 0.1 
        }
    }
}
```

- `openDate` format: ISO (UTC)

**Response:**  
`201 Created`
``` JSON
{
    "message": "Time capsule created!",
    "capsuleId": 2
}
```

---

<a name="calendar-api"></a>
## 📅 Calendar API (Diary/Mood Log)

### 4.1 ดึง diary ทั้งหมด (GET)

**Endpoint:**  
`GET /api/users/:userId/calendar-entries`

**Response:**
``` JSON
[
    {
        "id": 1,
        "user_id": 2,
        "entry_date": "2024-06-20",
        "text_content": "วันที่ดีมาก!",
        "mood": "happy",
        "created_at": "2024-06-20T12:35:00.000Z"
    }
    ...
]
```
---

### 4.2 สร้าง/อัปเดต diary (POST)

**Endpoint:**  
`POST /api/calendar-entries`

**Request**
``` JSON
{
    "userId": 2,
    "date": "2024-07-01",
    "text": "รู้สึกเศร้านิดหน่อย",
    "mood": "sad"
}
```

- วันหนึ่งมีได้ 1 entry/user (ระบบจะ update ถ้าเจอวันเดียวกันอยู่แล้ว)

**Response:**  
`200 OK`
``` JSON
{ "message": "Entry saved successfully" }
```


---
## 🌐 AI (รันบน localhost)

http://localhost:3030/  


---
### 1 ทำนายข้อความ (POST)
**Endpoint:**  
`POST /predict`

**Request**
``` JSON
{
    "text": "Example text"
}
```
**Response:**  
`200 OK`
``` JSON
{ 
    "preds": 1,
    "probs": [
        0.XXXXXXX,
        0.XXXXXXX,
        0.XXXXXXX,
        0.XXXXXXX,
    ] 
}
```
---
### 2 ดึงอิโมจิ (POST)
**Endpoint:**  
`POST /getEmoji`

**Request**
``` JSON
{
    "text": "Example text"
}
```
**Response:**  
`200 OK`
``` JSON
{ 
    "anger": 0,
    "fear": 0,
    "joy": 0,
    "neutral": 0.6592810153961182,
    "pleasant": 0.33474764227867126,
    "sadness": 0,
    "surprise": 0
}
```

