# /backend/Dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

# คัดลอกแค่ package.json มาก่อนเพื่อใช้ cache ของ Docker
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกไฟล์โค้ดทั้งหมด
COPY . .

# คำสั่งให้ server เริ่มทำงาน
CMD ["npm", "run", "start"]