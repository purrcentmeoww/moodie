// /backend/server.js
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors"); // <-- 1. Import เข้ามา

const app = express();
const port = 4000;

app.use(cors()); // <-- 2. สั่งให้ Express ใช้งาน
app.use(express.json());

// ทำให้ Express อ่าน JSON body ที่ส่งมาจาก Front-end ได้
app.use(express.json());

const dbConfig = {
  host: "db",
  user: "user",
  password: "password",
  database: "moodie_db",
};

// --- ฟังก์ชันผู้ช่วยสำหรับบันทึก Log ---
const logActivity = async (userId, action, details = null) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      "INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)",
      [userId, action, details ? JSON.stringify(details) : null]
    );
    console.log(`[LOG] Activity logged for user ${userId}: ${action}`);
  } catch (error) {
    // ไม่ต้องส่ง error กลับไปหา user เพราะนี่เป็นระบบหลังบ้าน
    console.error("!!! Failed to log activity:", error);
  } finally {
    if (connection) await connection.end();
  }
};

// --- API สำหรับ Empathy Wall ---

// 1. API สำหรับดึงโพสต์ทั้งหมด (GET) *
app.get("/api/posts", async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    // Query ใหม่ที่ซับซ้อนขึ้น:
    // 1. JOIN กับตาราง users เพื่อเอา username มาด้วย
    // 2. ใช้ Subquery เพื่อนับจำนวนคอมเมนต์ (comment_count) ของแต่ละโพสต์
    const sql = `
        SELECT 
            p.*, 
            u.username,
            (SELECT COUNT(*) FROM empathy_comments c WHERE c.post_id = p.id) as comment_count
        FROM 
            empathy_posts p
        LEFT JOIN 
            users u ON p.user_id = u.id
        ORDER BY 
            p.created_at DESC;
    `;
    const [rows] = await connection.execute(sql);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  } finally {
    if (connection) await connection.end();
  }
});

// 2. API สำหรับสร้างโพสต์ใหม่ (POST) *
app.post("/api/posts", async (req, res) => {
  const { text, userId } = req.body;
  if (!text || !userId) {
    return res.status(400).json({ error: "Text and userId are required" });
  }
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      "INSERT INTO empathy_posts (text_content, user_id) VALUES (?, ?)",
      [text, userId]
    );
    await logActivity(userId, "CREATE_POST", { postId: result.insertId }); // <-- บันทึก Log
    res.status(201).json({ message: "Post created!", postId: result.insertId });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  } finally {
    if (connection) await connection.end();
  }
});

// /backend/server.js

// ... (โค้ด API ของ posts เหมือนเดิม) ...

// --- API ใหม่สำหรับ Comments ---

// 3. API สำหรับดึงคอมเมนต์ทั้งหมดของโพสต์เดียว (GET)
// /backend/server.js

// /backend/server.js

// 3. API สำหรับดึงคอมเมนต์ทั้งหมดของโพสต์เดียว (GET) *
app.get("/api/posts/:postId/comments", async (req, res) => {
    const { postId } = req.params;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        // **แก้ไข:** JOIN กับตาราง users เพื่อเอา user_id และ username มาด้วย
        const sql = `
            SELECT c.*, u.username 
            FROM empathy_comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ? 
            ORDER BY c.created_at ASC
        `;
        const [rows] = await connection.execute(sql, [postId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    } finally {
        if (connection) await connection.end();
    }
});

// 4. API สำหรับสร้างคอมเมนต์ใหม่ (POST) *
app.post("/api/posts/:postId/comments", async (req, res) => {
    const { postId } = req.params;
    const { text, userId } = req.body;
    if (!text || !userId) {
        return res.status(400).json({ error: "Text and userId are required" });
    }
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        // **แก้ไข:** เพิ่ม user_id เข้าไปตอน INSERT
        const [result] = await connection.execute(
            'INSERT INTO empathy_comments (post_id, text_content, user_id) VALUES (?, ?, ?)',
            [postId, text, userId]
        );
        res.status(201).json({ message: "Comment created!", commentId: result.insertId });
    } catch (error) {
        res.status(500).json({ error: "Failed to create comment" });
    } finally {
        if (connection) await connection.end();
    }
});

// *
app.delete('/api/comments/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT user_id FROM empathy_comments WHERE id = ?', [commentId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (rows[0].user_id !== userId) {
            return res.status(403).json({ error: 'Forbidden: You can only delete your own comments' });
        }

        await connection.execute('DELETE FROM empathy_comments WHERE id = ?', [commentId]);
        res.status(200).json({ message: 'Comment deleted successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Failed to delete comment' });
    } finally {
        if (connection) await connection.end();
    }
});

// 5. API สำหรับลบโพสต์ (DELETE) *
app.delete("/api/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body; // รับ userId ของคนที่กดลบ

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    // 1. ตรวจสอบก่อนว่าโพสต์นี้เป็นของ user คนนี้จริงหรือไม่
    const [rows] = await connection.execute(
      "SELECT user_id FROM empathy_posts WHERE id = ?",
      [postId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const postOwnerId = rows[0].user_id;
    if (postOwnerId !== userId) {
      // ถ้า ID ไม่ตรงกัน -> ไม่อนุญาตให้ลบ
      return res
        .status(403)
        .json({ error: "Forbidden: You can only delete your own posts" });
    }

    // 2. ถ้าเป็นเจ้าของจริง -> อนุญาตให้ลบ
    await connection.execute("DELETE FROM empathy_posts WHERE id = ?", [
      postId,
    ]);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(`Error deleting post ${postId}:`, error);
    res.status(500).json({ error: "Failed to delete post" });
  } finally {
    if (connection) await connection.end();
  }
});


// --- API ที่อัปเกรดแล้ว ---

// API User Login *
app.post("/api/users/login", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username is required" });

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    let [rows] = await connection.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (rows.length > 0) {
      const user = rows[0];
      await logActivity(user.id, "USER_LOGIN"); // <-- บันทึก Log
      res.json(user);
    } else {
      const [result] = await connection.execute(
        "INSERT INTO users (username) VALUES (?)",
        [username]
      );
      const newUser = { id: result.insertId, username: username };
      await logActivity(newUser.id, "USER_REGISTER"); // <-- บันทึก Log
      res.status(201).json(newUser);
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  } finally {
    if (connection) await connection.end();
  }
});

// 1. API สำหรับสร้างแคปซูลใหม่ (POST) *
app.post("/api/capsules", async (req, res) => {
  const { userId, text, openDate, pastAnalysis } = req.body;

  if (!userId || !text || !openDate) {
    return res
      .status(400)
      .json({ error: "userId, text, and openDate are required" });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // --- จุดที่แก้ไข ---
    // แปลง ISO String ที่ได้จาก Front-end ให้เป็น Date Object
    // ที่ library mysql2 สามารถเข้าใจและแปลงเป็น format ที่ถูกต้องได้
    const formattedOpenDate = new Date(openDate);

    const [result] = await connection.execute(
      "INSERT INTO time_capsules (user_id, text_content, open_date, past_analysis) VALUES (?, ?, ?, ?)",
      // ส่ง Date Object ที่แปลงแล้วเข้าไปแทน
      [userId, text, formattedOpenDate, JSON.stringify(pastAnalysis)]
    );

    // (Optional) เราสามารถเพิ่ม Log ตรงนี้ได้ในอนาคต
    // await logActivity(userId, 'CREATE_CAPSULE', { capsuleId: result.insertId });

    res
      .status(201)
      .json({ message: "Time capsule created!", capsuleId: result.insertId });
  } catch (error) {
    console.error("Error creating time capsule:", error);
    res.status(500).json({ error: "Failed to create time capsule" });
  } finally {
    if (connection) await connection.end();
  }
});

// 2. API สำหรับดึงแคปซูลทั้งหมดของ User คนเดียว (GET) *
app.get("/api/users/:userId/capsules", async (req, res) => {
  const { userId } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT * FROM time_capsules WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error(`Error fetching capsules for user ${userId}:`, error);
    res.status(500).json({ error: "Failed to fetch capsules" });
  } finally {
    if (connection) await connection.end();
  }
});

// --- API Calendar Entries --- *
app.get("/api/users/:userId/calendar-entries", async (req, res) => {
  const { userId } = req.params;
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT * FROM calendar_entries WHERE user_id = ?",
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error(`Error fetching calendar entries for user ${userId}:`, error);
    res.status(500).json({ error: "Failed to fetch entries" });
  } finally {
    if (connection) await connection.end();
  }
});
// *
app.post("/api/calendar-entries", async (req, res) => {
  const { userId, date, text, mood } = req.body;
  if (!userId || !date || !text || !mood) {
    return res
      .status(400)
      .json({ error: "userId, date, text, and mood are required" });
  }
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const sql = `
            INSERT INTO calendar_entries (user_id, entry_date, text_content, mood)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            text_content = VALUES(text_content),
            mood = VALUES(mood);
        `;
    await connection.execute(sql, [userId, date, text, mood]);
    res.status(200).json({ message: "Entry saved successfully" });
  } catch (error) {
    console.error("Error saving calendar entry:", error);
    res.status(500).json({ error: "Failed to save entry" });
  } finally {
    if (connection) await connection.end();
  }
});

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
