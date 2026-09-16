import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Chuỗi kết nối MongoDB (Mặc định lấy từ file .env)
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://slen010207_db_user:AvNLUVb6niqz0z1f@cluster0.xxxx.mongodb.net/phan_mem_quan_ly_mon_an?retryWrites=true&w=majority";

export async function connectDB() {
    try {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Kết nối MongoDB thành công qua Node.js!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi kết nối MongoDB:', error.message);
        process.exit(1);
    }
}

connectDB();
