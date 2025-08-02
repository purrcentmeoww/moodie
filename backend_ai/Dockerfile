# /backend_ai/Dockerfile

# 1. เลือกใช้ Python เวอร์ชันที่ใหม่ขึ้น เป็น 3.10
FROM python:3.10-slim

# 2. ตั้งค่าพื้นที่ทำงาน
WORKDIR /app

# 3. คัดลอกไฟล์ที่บอกว่าต้องติดตั้งอะไรบ้าง
COPY requirements.txt .

# 4. ติดตั้ง library ที่จำเป็นทั้งหมด
# เราจะติดตั้ง torch แยกก่อนเพื่อความเสถียร
RUN pip install torch==2.2.2 torchvision==0.17.2 torchaudio==2.2.2 --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# 5. คัดลอกไฟล์โปรเจกต์ทั้งหมดเข้าไปในบ้าน
COPY . .

# 6. คำสั่งสุดท้ายเพื่อรันเซิร์ฟเวอร์ AI
CMD ["python", "main.py"]
