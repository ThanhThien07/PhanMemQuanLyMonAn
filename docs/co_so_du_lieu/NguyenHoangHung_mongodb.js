/**
 * =========================================================================
 * TRƯỜNG CAO ĐẲNG CÔNG NGHỆ THÔNG TIN TP.HCM
 * KHOA CÔNG NGHỆ THÔNG TIN - ĐIỆN TỬ
 * ĐỒ ÁN MÔN HỌC: CƠ SỞ DỮ LIỆU NoSQL / HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU
 * ĐỀ TÀI: THIẾT KẾ VÀ CÀI ĐẶT CƠ SỞ DỮ LIỆU NoSQL MONGODB CHO HỆ THỐNG
 *         QUẢN LÝ NHÀ HÀNG & GỌI MÓN CAO CẤP (ROYAL BISTRO)
 * GIẢNG VIÊN HƯỚNG DẪN: CÔ HÀ MĨ TRINH
 * =========================================================================
 * THÔNG TIN NHÓM THỰC HIỆN:
 *   - Nhóm: Nhóm 05
 *   - Trưởng nhóm: NGUYỄN HOÀNG HƯNG
 *   - Sinh viên thực hiện:
 *       1. Nguyễn Hoàng Hưng - MSSV: 501250384
 *       2. Cao Trần Xuân Diệu
 * HỆ QUẢN TRỊ CSDL: MongoDB 6.0+ / 7.0+ (Mongoose ODM / Mongosh Shell)
 * TÊN DATABASE: royal_bistro (hoặc quan_ly_nha_hang)
 * =========================================================================
 * CÁCH THỰC THI SCRIPT:
 *   Cách 1 (Mongosh CLI):
 *     mongosh "mongodb://127.0.0.1:27017/royal_bistro" < NguyenHoangHung_mongodb.js
 *   Cách 2 (MongoDB Compass):
 *     Mở tab "_mongosh" ở góc dưới MongoDB Compass, copy toàn bộ nội dung dán vào và nhấn Enter.
 *   Cách 3 (Node.js):
 *     cd BE && npm run seed
 * =========================================================================
 */

// =========================================================================
// PHẦN 1: CHỌN DATABASE VÀ LÀM SẠCH DỮ LIỆU CŨ (CLEANUP)
// =========================================================================
const TEN_CSDL = 'royal_bistro';
db = db.getSiblingDB(TEN_CSDL);

print(`========================================================`);
print(`🍃 ĐANG KHỞI TẠO CƠ SỞ DỮ LIỆU MONGODB: [${TEN_CSDL}]...`);
print(`========================================================`);

// Danh sách các collection chính của hệ thống Royal Bistro
const danhSachCollection = [
  'users',            // Danh mục nhân sự, tài khoản phân quyền RBAC
  'categories',       // Danh mục phân loại thực đơn
  'dishes',           // Thực đơn món ăn và đồ uống
  'tables',           // Sơ đồ mặt bằng bàn ăn 3 tầng
  'customers',        // CRM khách hàng thân thiết, tích điểm VIP
  'orders',           // Đơn gọi món, chi tiết món theo bàn và thanh toán
  'ingredients',      // Kho nguyên vật liệu thực phẩm
  'dishingredients',   // Định mức công thức BOM trừ kho tự động
  'suppliers',        // Danh sách đối tác nhà cung cấp
  'reservations',     // Lịch hẹn đặt bàn tiệc trước
  'reports',          // Biên bản chốt ca và báo cáo doanh thu
  'reviews',          // Đánh giá phản hồi dịch vụ từ thực khách
  'counters'          // Bộ đếm tự tăng (Auto-increment sequence)
];

danhSachCollection.forEach((tenCol) => {
  db[tenCol].drop();
});
print(`🗑️  Đã dọn dẹp và làm mới toàn bộ các collections.`);

// =========================================================================
// PHẦN 2: THIẾT LẬP VALIDATION JSON SCHEMA VÀ CHỈ MỤC (INDEXES)
// =========================================================================

// 1. Tạo Collection 'users' (Nhân sự) kèm JSON Schema Validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'name', 'email', 'password', 'role'],
      properties: {
        id: { bsonType: 'int', description: 'Mã số tự tăng duy nhất của nhân viên' },
        name: { bsonType: 'string', description: 'Họ tên nhân viên' },
        email: { bsonType: 'string', pattern: '^.+@.+$', description: 'Email đăng nhập hợp lệ' },
        password: { bsonType: 'string', description: 'Chuỗi mật khẩu băm Bcrypt' },
        role: { 
          enum: ['admin', 'thu_ngan', 'bep', 'phuc_vu', 'khach_hang', 'customer'],
          description: 'Vai trò phân quyền RBAC' 
        },
        so_dien_thoai: { bsonType: 'string' },
        trang_thai: { enum: ['hoat_dong', 'tam_khoa', 'da_nghi'] }
      }
    }
  }
});
db.users.createIndex({ id: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

// 2. Tạo Collection 'categories' (Loại Món)
db.createCollection('categories', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'ma_loai', 'ten_loai'],
      properties: {
        id: { bsonType: 'int' },
        ma_loai: { bsonType: 'string' },
        ten_loai: { bsonType: 'string' }
      }
    }
  }
});
db.categories.createIndex({ id: 1 }, { unique: true });
db.categories.createIndex({ ma_loai: 1 }, { unique: true });

// 3. Tạo Collection 'dishes' (Thực Đơn Món Ăn)
db.createCollection('dishes', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'ten_mon', 'gia'],
      properties: {
        id: { bsonType: 'int' },
        loai_mon_id: { bsonType: ['int', 'null'] },
        ten_mon: { bsonType: 'string' },
        gia: { bsonType: 'number', minimum: 0 },
        mo_ta: { bsonType: 'string' },
        hinh_anh: { bsonType: 'string' },
        thoi_gian_nau: { bsonType: 'int', minimum: 1 },
        trang_thai: { enum: ['con_hang', 'tam_het', 'ngung_ban', 'tam_ngung', 'het_hang'] }
      }
    }
  }
});
db.dishes.createIndex({ id: 1 }, { unique: true });
db.dishes.createIndex({ loai_mon_id: 1 });
db.dishes.createIndex({ trang_thai: 1 });
db.dishes.createIndex({ ten_mon: 'text' }); // Hỗ trợ tìm kiếm toàn văn Full-text search

// 4. Tạo Collection 'tables' (Sơ Đồ Bàn Ăn)
db.createCollection('tables', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'so_ban'],
      properties: {
        id: { bsonType: 'int' },
        so_ban: { bsonType: 'int' },
        suc_chua: { bsonType: 'int', minimum: 1 },
        trang_thai: { enum: ['trong', 'co_khach', 'da_dat'] },
        khu_vuc: { bsonType: 'string' },
        yeu_cau_thanh_toan: { bsonType: 'int' },
        so_luong_khach: { bsonType: 'int', minimum: 0 }
      }
    }
  }
});
db.tables.createIndex({ id: 1 }, { unique: true });
db.tables.createIndex({ so_ban: 1 }, { unique: true });
db.tables.createIndex({ trang_thai: 1 });
db.tables.createIndex({ khu_vuc: 1 });

// 5. Tạo Collection 'customers' (Khách Hàng CRM)
db.createCollection('customers', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'ho_ten', 'so_dien_thoai'],
      properties: {
        id: { bsonType: 'int' },
        ho_ten: { bsonType: 'string' },
        so_dien_thoai: { bsonType: 'string' },
        email: { bsonType: 'string' },
        diem_tich_luy: { bsonType: 'number', minimum: 0 },
        hang_thanh_vien: { enum: ['Dong', 'Bac', 'Vang', 'KimCuong'] },
        tong_chi_tieu: { bsonType: 'number', minimum: 0 }
      }
    }
  }
});
db.customers.createIndex({ id: 1 }, { unique: true });
db.customers.createIndex({ so_dien_thoai: 1 }, { unique: true });
db.customers.createIndex({ hang_thanh_vien: 1 });

// 6. Tạo Collection 'orders' (Đơn Gọi Món & Hóa Đơn)
db.createCollection('orders', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'ban_id', 'mon_an_id'],
      properties: {
        id: { bsonType: 'int' },
        ban_id: { bsonType: 'int' },
        mon_an_id: { bsonType: 'int' },
        khach_hang_id: { bsonType: ['int', 'null'] },
        so_luong: { bsonType: 'int', minimum: 1 },
        don_gia: { bsonType: 'number', minimum: 0 },
        tong_tien: { bsonType: 'number', minimum: 0 },
        trang_thai: { enum: ['cho_xac_nhan', 'dang_che_bien', 'da_phuc_vu', 'hoan_thanh', 'da_huy'] },
        phuong_thuc_thanh_toan: { bsonType: 'string' }
      }
    }
  }
});
db.orders.createIndex({ id: 1 }, { unique: true });
db.orders.createIndex({ ban_id: 1, trang_thai: 1 });
db.orders.createIndex({ mon_an_id: 1 });
db.orders.createIndex({ createdAt: -1 });

// 7. Tạo Collection 'ingredients' (Nguyên Liệu Kho)
db.createCollection('ingredients');
db.ingredients.createIndex({ id: 1 }, { unique: true });
db.ingredients.createIndex({ ten_nguyen_lieu: 1 });

// 8. Tạo Collection 'dishingredients' (Định Lượng BOM)
db.createCollection('dishingredients');
db.dishingredients.createIndex({ id: 1 }, { unique: true });
db.dishingredients.createIndex({ mon_an_id: 1, nguyen_lieu_id: 1 });

// 9. Tạo Collection 'suppliers' (Nhà Cung Cấp)
db.createCollection('suppliers');
db.suppliers.createIndex({ id: 1 }, { unique: true });
db.suppliers.createIndex({ ma_ncc: 1 }, { unique: true });

// 10. Tạo Collection 'reservations' (Đặt Bàn Trước)
db.createCollection('reservations');
db.reservations.createIndex({ id: 1 }, { unique: true });
db.reservations.createIndex({ ma_reservation: 1 }, { unique: true });
db.reservations.createIndex({ thoi_gian_hen: 1 });

// 11. Tạo Collection 'reports' (Báo Cáo Doanh Thu)
db.createCollection('reports');
db.reports.createIndex({ id: 1 }, { unique: true });
db.reports.createIndex({ ma_bao_cao: 1 }, { unique: true });

// 12. Tạo Collection 'reviews' (Đánh Giá Phản Hồi)
db.createCollection('reviews');
db.reviews.createIndex({ id: 1 }, { unique: true });
db.reviews.createIndex({ ban_id: 1 });

// 13. Tạo Collection 'counters' (Bộ Đếm Tự Tăng)
db.createCollection('counters');

print(`⚙️  Đã khởi tạo thành công 13 Collections, JSON Schema Rules và Indexes.`);

// =========================================================================
// PHẦN 3: NẠP DỮ LIỆU KHỞI TẠO (SEED DATA)
// =========================================================================

// Chuỗi băm mật khẩu mặc định "123456" theo chuẩn Bcrypt
const BCRYPT_HASH_123456 = '$2a$10$w0qWqWk7gXh8B12k6yVke.5V7U93.Mh70jW8.Xv0lDsk86Bq1U6gK';

// 1. Chèn danh mục nhân viên & tài khoản (Users)
db.users.insertMany([
  { id: 1, name: 'Nguyễn Hoàng Hưng (Quản Lý)', email: 'admin@nhahang.com', password: BCRYPT_HASH_123456, role: 'admin', so_dien_thoai: '0901234567', trang_thai: 'hoat_dong', createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: 'Nguyễn Ngọc Hưng (Công Nghệ)', email: 'hoanghung.tech@royalbistro.vn', password: BCRYPT_HASH_123456, role: 'admin', so_dien_thoai: '0902345678', trang_thai: 'hoat_dong', createdAt: new Date(), updatedAt: new Date() },
  { id: 3, name: 'Trần Thị Mai Phương (Thu Ngân)', email: 'thungan@nhahang.com', password: BCRYPT_HASH_123456, role: 'thu_ngan', so_dien_thoai: '0903456789', trang_thai: 'hoat_dong', createdAt: new Date(), updatedAt: new Date() },
  { id: 4, name: 'Lê Hoàng Nam (Thu Ngân Ca 2)', email: 'hoangnam.cashier@royalbistro.vn', password: BCRYPT_HASH_123456, role: 'thu_ngan', so_dien_thoai: '0904567890', trang_thai: 'hoat_dong', createdAt: new Date(), updatedAt: new Date() },
  { id: 5, name: 'Phạm Minh Tuấn (Bếp Trưởng)', email: 'bep@nhahang.com', password: BCRYPT_HASH_123456, role: 'bep', so_dien_thoai: '0905678901', trang_thai: 'hoat_dong', createdAt: new Date(), updatedAt: new Date() },
  { id: 6, name: 'Vũ Đức Trọng (Bếp Phó Chảo)', email: 'ductrong.chef@royalbistro.vn', password: BCRYPT_HASH_123456, role: 'bep', so_dien_thoai: '0906789012', trang_thai: 'hoat_dong', createdAt: new Date(), updatedAt: new Date() },
  { id: 7, name: 'Đặng Thùy Linh (Tổ Trưởng Phục Vụ)', email: 'phucvu@nhahang.com', password: BCRYPT_HASH_123456, role: 'phuc_vu', so_dien_thoai: '0907890123', trang_thai: 'hoat_dong', createdAt: new Date(), updatedAt: new Date() },
  { id: 8, name: 'Hoàng Bảo Long (Phục Vụ Tầng 2)', email: 'baolong.waiter@royalbistro.vn', password: BCRYPT_HASH_123456, role: 'phuc_vu', so_dien_thoai: '0908901234', trang_thai: 'hoat_dong', createdAt: new Date(), updatedAt: new Date() },
  { id: 9, name: 'Bùi Mỹ Duyên (Phục Vụ VIP)', email: 'myduyen.waiter@royalbistro.vn', password: BCRYPT_HASH_123456, role: 'phuc_vu', so_dien_thoai: '0909012345', trang_thai: 'hoat_dong', createdAt: new Date(), updatedAt: new Date() },
  { id: 10, name: 'Ngô Quốc Khánh (Phục Vụ Sân Thượng)', email: 'quockhanh.waiter@royalbistro.vn', password: BCRYPT_HASH_123456, role: 'phuc_vu', so_dien_thoai: '0910123456', trang_thai: 'hoat_dong', createdAt: new Date(), updatedAt: new Date() }
]);

// 2. Chèn danh mục loại món (Categories)
db.categories.insertMany([
  { id: 1, ma_loai: 'KHAI_VI', ten_loai: 'Món Khai Vị', createdAt: new Date(), updatedAt: new Date() },
  { id: 2, ma_loai: 'MON_CHINH', ten_loai: 'Món Chính Đặc Sắc', createdAt: new Date(), updatedAt: new Date() },
  { id: 3, ma_loai: 'MON_NUONG_BBQ', ten_loai: 'Món Nướng & BBQ', createdAt: new Date(), updatedAt: new Date() },
  { id: 4, ma_loai: 'HAI_SAN', ten_loai: 'Hải Sản Cao Cấp', createdAt: new Date(), updatedAt: new Date() },
  { id: 5, ma_loai: 'TRANG_MIENG', ten_loai: 'Món Tráng Miệng', createdAt: new Date(), updatedAt: new Date() },
  { id: 6, ma_loai: 'THUC_UONG', ten_loai: 'Đồ Uống & Rượu Vang', createdAt: new Date(), updatedAt: new Date() }
]);

// 3. Chèn 30 món ăn thực đơn nhà hàng (Dishes)
db.dishes.insertMany([
  { id: 1, loai_mon_id: 1, ten_mon: 'Salad Cá Hồi Xông Khói Sốt Chanh Dây', gia: 145000, mo_ta: 'Cá hồi Na Uy xông khói, xà lách Romanie, trứng cá chuồn và sốt chanh leo tươi mát', hinh_anh: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500', thoi_gian_nau: 10, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 2, loai_mon_id: 1, ten_mon: 'Súp Bào Ngư Vi Cá Hầm Nấm Đông Cô', gia: 280000, mo_ta: 'Bào ngư tươi hầm nước cốt gà thượng hạng thơm bùi bổ dưỡng chuẩn vị hoàng gia', hinh_anh: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500', thoi_gian_nau: 15, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 3, loai_mon_id: 1, ten_mon: 'Bánh Mì Bơ Tỏi Nướng Phô Mai Mozzarella', gia: 65000, mo_ta: 'Bánh mì nướng vàng giòn thơm ngậy bơ tỏi Đà Lạt và phô mai Mozzarella kéo sợi', hinh_anh: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500', thoi_gian_nau: 8, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 4, loai_mon_id: 1, ten_mon: 'Gỏi Củ Hủ Dừa Tôm Thịt Cung Đình', gia: 125000, mo_ta: 'Củ hủ dừa Bến Tre giòn ngọt, tôm sú bóc nõn, tai heo thái mỏng kèm bánh phồng tôm', hinh_anh: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500', thoi_gian_nau: 10, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 5, loai_mon_id: 2, ten_mon: 'Bò Bít Tết Wagyu Úc Sốt Tiêu Đen', gia: 450000, mo_ta: 'Thịt bò Wagyu vân mỡ tuyệt hảo nướng than hoa kèm sốt tiêu Phú Quốc đặc biệt', hinh_anh: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500', thoi_gian_nau: 20, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 6, loai_mon_id: 2, ten_mon: 'Sườn Cừu Nướng Thảo Mộc Sốt Rượu Vang Đỏ', gia: 390000, mo_ta: 'Sườn cừu New Zealand ướp hương thảo và sốt vang đỏ Bordeaux sánh mịn', hinh_anh: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500', thoi_gian_nau: 22, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 7, loai_mon_id: 2, ten_mon: 'Gà Quay Mật Ong Da Giòn Bánh Bao', gia: 260000, mo_ta: 'Gà ta thả đồi ướp mật ong rừng Tây Bắc da giòn rụm ăn kèm bánh bao chiên', hinh_anh: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=500', thoi_gian_nau: 20, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 8, loai_mon_id: 2, ten_mon: 'Cá Hồi Áp Chảo Sốt Bơ Tỏi Măng Tây', gia: 320000, mo_ta: 'Thăn cá hồi Nauy áp chảo da giòn thịt mọng nước, măng tây xào bơ tỏi Anchor', hinh_anh: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500', thoi_gian_nau: 18, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 9, loai_mon_id: 2, ten_mon: 'Cơm Chiên Hải Sản Hoàng Kim Trứng Muối', gia: 165000, mo_ta: 'Cơm chiên hạt ngọc thơm lừng phủ sốt trứng muối hoàng kim, mực và tôm tươi', hinh_anh: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500', thoi_gian_nau: 15, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 10, loai_mon_id: 2, ten_mon: 'Mì Ý Sốt Bò Bằm Bolognaise Phô Mai', gia: 155000, mo_ta: 'Mì Spaghetti Ý sốt cà chua thịt bò bằm đậm đà rắc phô mai Parmesan bào', hinh_anh: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500', thoi_gian_nau: 15, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 11, loai_mon_id: 3, ten_mon: 'Sườn Heo Nướng Tảng BBQ Kiểu Mỹ', gia: 340000, mo_ta: 'Sườn heo ướp sốt BBQ đậm vị nướng chậm 4 tiếng mềm tan từng thớ thịt', hinh_anh: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500', thoi_gian_nau: 20, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 12, loai_mon_id: 3, ten_mon: 'Thịt Ba Chỉ Bò Mỹ Nướng Sốt Bulgogi', gia: 195000, mo_ta: 'Thịt ba chỉ bò Mỹ cuộn nấm kim châm nướng than hoa thơm nức mũi', hinh_anh: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500', thoi_gian_nau: 15, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 13, loai_mon_id: 3, ten_mon: 'Bạch Tuộc Nướng Sa Tế Cay Nồng', gia: 185000, mo_ta: 'Bạch tuộc đại dương nướng muối ớt sa tế cay tê tái chấm muối ớt xanh', hinh_anh: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500', thoi_gian_nau: 18, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 14, loai_mon_id: 3, ten_mon: 'Hàu Nướng Phô Mai Béo Ngậy (6 con)', gia: 160000, mo_ta: 'Hàu sữa Pháp tươi sống nướng sốt phô mai trứng béo ngậy thơm nức lòng', hinh_anh: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500', thoi_gian_nau: 12, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 15, loai_mon_id: 4, ten_mon: 'Tôm Hùm Alaska Đút Lò Phô Mai', gia: 750000, mo_ta: 'Tôm hùm Alaska nguyên con đút lò cùng sốt kem bơ và phô mai thượng hạng', hinh_anh: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=500', thoi_gian_nau: 25, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 16, loai_mon_id: 4, ten_mon: 'Cua Cà Mau Rang Me Chua Ngọt', gia: 480000, mo_ta: 'Cua thịt Cà Mau tươi sống chắc nịch quyện cùng sốt me chua ngọt đậm đà', hinh_anh: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=500', thoi_gian_nau: 22, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 17, loai_mon_id: 4, ten_mon: 'Mực Hấp Gừng Hành Hương', gia: 210000, mo_ta: 'Mực ống Phú Quốc tươi rói hấp giữ nguyên vị ngọt thanh cùng nước mắm gừng', hinh_anh: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500', thoi_gian_nau: 15, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 18, loai_mon_id: 4, ten_mon: 'Lẩu Hải Sản TomYum Thái Lan Chua Cay', gia: 380000, mo_ta: 'Nước dùng chua cay đậm đà, tôm sú, mực, ngao hoa, nấm tươi và mì trứng', hinh_anh: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=500', thoi_gian_nau: 25, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 19, loai_mon_id: 5, ten_mon: 'Bánh Tiramisu Truyền Thống Ý', gia: 75000, mo_ta: 'Bánh mềm xốp vị cà phê espresso, rượu rum quyện kem mascarpone béo ngậy', hinh_anh: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500', thoi_gian_nau: 8, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 20, loai_mon_id: 5, ten_mon: 'Panna Cotta Sốt Dâu Tây', gia: 65000, mo_ta: 'Kem sữa béo mịn tan ngay nơi đầu lưỡi cùng vị sốt dâu tây chua thanh sảng khoái', hinh_anh: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=500', thoi_gian_nau: 8, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 21, loai_mon_id: 5, ten_mon: 'Kem Mousse Socola Bỉ', gia: 80000, mo_ta: 'Socola đen nguyên chất 70% từ Bỉ mịn màng đậm vị đắng ngọt ngào', hinh_anh: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=500', thoi_gian_nau: 8, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 22, loai_mon_id: 5, ten_mon: 'Chè Hạt Sen Long Nhãn Táo Đỏ', gia: 55000, mo_ta: 'Hạt sen Huế bùi bùi nấu đường phèn thanh khiết cùng long nhãn và táo đỏ bổ dưỡng', hinh_anh: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=500', thoi_gian_nau: 8, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 23, loai_mon_id: 5, ten_mon: 'Trái Cây Thập Cẩm Theo Mùa', gia: 95000, mo_ta: 'Đĩa trái cây tươi chọn lọc: dưa lưới, nho Mỹ, kiwi, dâu tây Đà Lạt mát lạnh', hinh_anh: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=500', thoi_gian_nau: 5, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 24, loai_mon_id: 6, ten_mon: 'Rượu Vang Đỏ Chateau Bordeaux', gia: 850000, mo_ta: 'Vang đỏ Pháp niên vụ 2020 vị chát mượt mà, hòa quyện tuyệt vời với bít tết Wagyu', hinh_anh: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500', thoi_gian_nau: 5, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 25, loai_mon_id: 6, ten_mon: 'Cocktail Mojito Bạc Hà Truyền Thống', gia: 95000, mo_ta: 'Rượu Rum trắng, lá bạc hà tươi, chanh xanh và soda giải nhiệt cực đã', hinh_anh: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', thoi_gian_nau: 5, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 26, loai_mon_id: 6, ten_mon: 'Nước Ép Cam Tươi Nguyên Chất', gia: 45000, mo_ta: 'Cam sành mọng nước vắt tươi 100% không thêm đường hóa học giàu vitamin C', hinh_anh: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', thoi_gian_nau: 5, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 27, loai_mon_id: 6, ten_mon: 'Trà Đào Cam Sả Hạt Chia', gia: 50000, mo_ta: 'Trà đen Ceylon ủ lạnh kết hợp đào miếng giòn ngọt, cam vàng sả thơm và hạt chia', hinh_anh: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', thoi_gian_nau: 5, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 28, loai_mon_id: 6, ten_mon: 'Bia Heineken Silver Ướp Lạnh', gia: 35000, mo_ta: 'Bia lon 330ml ướp xô đá tuyết sảng khoái từng giọt', hinh_anh: 'https://images.unsplash.com/photo-1608270196883-9b87b2b80451?w=500', thoi_gian_nau: 3, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 29, loai_mon_id: 6, ten_mon: 'Bia Hoegaarden White Nhập Khẩu', gia: 65000, mo_ta: 'Bia trắng lúa mì Bỉ vị ngò tây và vỏ cam Curaçao êm dịu đặc trưng', hinh_anh: 'https://images.unsplash.com/photo-1608270196883-9b87b2b80451?w=500', thoi_gian_nau: 3, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() },
  { id: 30, loai_mon_id: 6, ten_mon: 'Nước Khoáng Tinh Khiết San Pellegrino', gia: 40000, mo_ta: 'Nước khoáng có ga nhập khẩu từ Ý trong chai thủy tinh sang trọng', hinh_anh: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=500', thoi_gian_nau: 3, trang_thai: 'con_hang', createdAt: new Date(), updatedAt: new Date() }
]);

// 4. Chèn 20 bàn ăn 3 tầng của nhà hàng (Tables)
db.tables.insertMany([
  { id: 1, so_ban: 1, suc_chua: 4, trang_thai: 'trong', khu_vuc: 'Tầng 1 - Sảnh Chính', yeu_cau_thanh_toan: 0, so_luong_khach: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, so_ban: 2, suc_chua: 4, trang_thai: 'co_khach', khu_vuc: 'Tầng 1 - Sảnh Chính', yeu_cau_thanh_toan: 0, so_luong_khach: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 3, so_ban: 3, suc_chua: 4, trang_thai: 'trong', khu_vuc: 'Tầng 1 - Sảnh Chính', yeu_cau_thanh_toan: 0, so_luong_khach: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 4, so_ban: 4, suc_chua: 6, trang_thai: 'co_khach', khu_vuc: 'Tầng 1 - Sảnh Chính', yeu_cau_thanh_toan: 0, so_luong_khach: 5, createdAt: new Date(), updatedAt: new Date() },
  { id: 5, so_ban: 5, suc_chua: 6, trang_thai: 'da_dat', khu_vuc: 'Tầng 1 - Sảnh Chính', yeu_cau_thanh_toan: 0, so_luong_khach: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 6, so_ban: 6, suc_chua: 8, trang_thai: 'trong', khu_vuc: 'Tầng 1 - Sảnh Chính', yeu_cau_thanh_toan: 0, so_luong_khach: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 7, so_ban: 7, suc_chua: 4, trang_thai: 'trong', khu_vuc: 'Tầng 1 - Sảnh Chính', yeu_cau_thanh_toan: 0, so_luong_khach: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 8, so_ban: 8, suc_chua: 4, trang_thai: 'trong', khu_vuc: 'Tầng 1 - Sảnh Chính', yeu_cau_thanh_toan: 0, so_luong_khach: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 9, so_ban: 9, suc_chua: 8, trang_thai: 'trong', khu_vuc: 'Tầng 2 - Phòng VIP', yeu_cau_thanh_toan: 0, so_luong_khach: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 10, so_ban: 10, suc_chua: 10, trang_thai: 'co_khach', khu_vuc: 'Tầng 2 - Phòng VIP', yeu_cau_thanh_toan: 0, so_luong_khach: 8, createdAt: new Date(), updatedAt: new Date() },
  { id: 11, so_ban: 11, suc_chua: 12, trang_thai: 'trong', khu_vuc: 'Tầng 2 - Phòng VIP', yeu_cau_thanh_toan: 0, so_luong_khach: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 12, so_ban: 12, suc_chua: 6, trang_thai: 'trong', khu_vuc: 'Tầng 2 - Phòng VIP', yeu_cau_thanh_toan: 0, so_luong_khach: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 13, so_ban: 13, suc_chua: 4, trang_thai: 'trong', khu_vuc: 'Tầng 2 - Phòng VIP', yeu_cau_thanh_toan: 0, so_luong_khach: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 14, so_ban: 14, suc_chua: 6, trang_thai: 'trong', khu_vuc: 'Tầng 2 - Phòng VIP', yeu_cau_thanh_toan: 0, so_luong_khach: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 15, so_ban: 15, suc_chua: 4, trang_thai: 'trong', khu_vuc: 'Tầng 3 - Sân Thượng', yeu_cau_thanh_toan: 0, so_luong_khach: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 16, so_ban: 16, suc_chua: 4, trang_thai: 'trong', khu_vuc: 'Tầng 3 - Sân Thượng', yeu_cau_thanh_toan: 0, so_luong_khach: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 17, so_ban: 17, suc_chua: 2, trang_thai: 'trong', khu_vuc: 'Tầng 3 - Sân Thượng', yeu_cau_thanh_toan: 0, so_luong_khach: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 18, so_ban: 18, suc_chua: 6, trang_thai: 'trong', khu_vuc: 'Tầng 3 - Sân Thượng', yeu_cau_thanh_toan: 0, so_luong_khach: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 19, so_ban: 19, suc_chua: 8, trang_thai: 'trong', khu_vuc: 'Tầng 3 - Sân Thượng', yeu_cau_thanh_toan: 0, so_luong_khach: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 20, so_ban: 20, suc_chua: 4, trang_thai: 'trong', khu_vuc: 'Tầng 3 - Sân Thượng', yeu_cau_thanh_toan: 0, so_luong_khach: 0, createdAt: new Date(), updatedAt: new Date() }
]);

// 5. Chèn khách hàng thân thiết CRM (Customers)
db.customers.insertMany([
  { id: 1, ho_ten: 'Nguyễn Văn An', so_dien_thoai: '0912345678', email: 'an.nguyen@gmail.com', diem_tich_luy: 450, hang_thanh_vien: 'Vang', tong_chi_tieu: 14500000, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, ho_ten: 'Trần Thị Bích', so_dien_thoai: '0987654321', email: 'bich.tran@gmail.com', diem_tich_luy: 820, hang_thanh_vien: 'KimCuong', tong_chi_tieu: 32000000, createdAt: new Date(), updatedAt: new Date() },
  { id: 3, ho_ten: 'Lê Hoàng Nam', so_dien_thoai: '0933112233', email: 'nam.le@gmail.com', diem_tich_luy: 120, hang_thanh_vien: 'Dong', tong_chi_tieu: 2800000, createdAt: new Date(), updatedAt: new Date() },
  { id: 4, ho_ten: 'Vũ Thùy Dương', so_dien_thoai: '0977889900', email: 'duong.vu@gmail.com', diem_tich_luy: 260, hang_thanh_vien: 'Bac', tong_chi_tieu: 6500000, createdAt: new Date(), updatedAt: new Date() },
  { id: 5, ho_ten: 'Phan Minh Khang', so_dien_thoai: '0966554433', email: 'khang.phan@gmail.com', diem_tich_luy: 560, hang_thanh_vien: 'Vang', tong_chi_tieu: 18900000, createdAt: new Date(), updatedAt: new Date() }
]);

// 6. Chèn nguyên vật liệu thực phẩm kho (Ingredients)
db.ingredients.insertMany([
  { id: 1, ten_nguyen_lieu: 'Thịt Bò Wagyu A5 Úc', don_vi_tinh: 'kg', so_luong_ton: 18.5, gia_nhap_trung_binh: 950000, dinh_muc_toi_thieu: 5, han_su_dung: new Date(Date.now() + 15 * 86400000), createdAt: new Date(), updatedAt: new Date() },
  { id: 2, ten_nguyen_lieu: 'Tôm Hùm Alaska Sống', don_vi_tinh: 'kg', so_luong_ton: 8.2, gia_nhap_trung_binh: 1200000, dinh_muc_toi_thieu: 3, han_su_dung: new Date(Date.now() + 8 * 86400000), createdAt: new Date(), updatedAt: new Date() },
  { id: 3, ten_nguyen_lieu: 'Cá Hồi Na Uy Phi Lê Tươi', don_vi_tinh: 'kg', so_luong_ton: 12.0, gia_nhap_trung_binh: 380000, dinh_muc_toi_thieu: 4, han_su_dung: new Date(Date.now() + 4 * 86400000), createdAt: new Date(), updatedAt: new Date() },
  { id: 4, ten_nguyen_lieu: 'Sườn Heo Tươi Cắt Tảng', don_vi_tinh: 'kg', so_luong_ton: 25.0, gia_nhap_trung_binh: 140000, dinh_muc_toi_thieu: 8, han_su_dung: new Date(Date.now() + 10 * 86400000), createdAt: new Date(), updatedAt: new Date() },
  { id: 5, ten_nguyen_lieu: 'Gà Ta Thả Vườn', don_vi_tinh: 'con', so_luong_ton: 30.0, gia_nhap_trung_binh: 160000, dinh_muc_toi_thieu: 10, han_su_dung: new Date(Date.now() + 6 * 86400000), createdAt: new Date(), updatedAt: new Date() },
  { id: 6, ten_nguyen_lieu: 'Gạo ST25 Thơm Lài', don_vi_tinh: 'kg', so_luong_ton: 85.0, gia_nhap_trung_binh: 24000, dinh_muc_toi_thieu: 20, han_su_dung: new Date(Date.now() + 180 * 86400000), createdAt: new Date(), updatedAt: new Date() },
  { id: 7, ten_nguyen_lieu: 'Bơ Lạt New Zealand Anchor', don_vi_tinh: 'kg', so_luong_ton: 5.5, gia_nhap_trung_binh: 180000, dinh_muc_toi_thieu: 5, han_su_dung: new Date(Date.now() + 45 * 86400000), createdAt: new Date(), updatedAt: new Date() },
  { id: 8, ten_nguyen_lieu: 'Tiêu Đen Sọ Phú Quốc', don_vi_tinh: 'kg', so_luong_ton: 4.0, gia_nhap_trung_binh: 220000, dinh_muc_toi_thieu: 2, han_su_dung: new Date(Date.now() + 365 * 86400000), createdAt: new Date(), updatedAt: new Date() },
  { id: 9, ten_nguyen_lieu: 'Rau Xà Lách Romanie Thủy Canh', don_vi_tinh: 'kg', so_luong_ton: 15.0, gia_nhap_trung_binh: 45000, dinh_muc_toi_thieu: 5, han_su_dung: new Date(Date.now() + 3 * 86400000), createdAt: new Date(), updatedAt: new Date() },
  { id: 10, ten_nguyen_lieu: 'Rượu Vang Đỏ Chai Nhập Khẩu', don_vi_tinh: 'chai', so_luong_ton: 28.0, gia_nhap_trung_binh: 480000, dinh_muc_toi_thieu: 6, han_su_dung: new Date(Date.now() + 730 * 86400000), createdAt: new Date(), updatedAt: new Date() }
]);

// 7. Chèn định lượng BOM công thức món ăn (DishIngredients)
db.dishingredients.insertMany([
  { id: 1, mon_an_id: 1, nguyen_lieu_id: 3, so_luong_can: 0.12, don_vi_tinh: 'kg', createdAt: new Date(), updatedAt: new Date() }, // Salad cá hồi
  { id: 2, mon_an_id: 1, nguyen_lieu_id: 9, so_luong_can: 0.15, don_vi_tinh: 'kg', createdAt: new Date(), updatedAt: new Date() },
  { id: 3, mon_an_id: 5, nguyen_lieu_id: 1, so_luong_can: 0.25, don_vi_tinh: 'kg', createdAt: new Date(), updatedAt: new Date() }, // Bò bít tết Wagyu
  { id: 4, mon_an_id: 5, nguyen_lieu_id: 8, so_luong_can: 0.02, don_vi_tinh: 'kg', createdAt: new Date(), updatedAt: new Date() },
  { id: 5, mon_an_id: 8, nguyen_lieu_id: 3, so_luong_can: 0.20, don_vi_tinh: 'kg', createdAt: new Date(), updatedAt: new Date() }, // Cá hồi áp chảo
  { id: 6, mon_an_id: 8, nguyen_lieu_id: 7, so_luong_can: 0.04, don_vi_tinh: 'kg', createdAt: new Date(), updatedAt: new Date() },
  { id: 7, mon_an_id: 11, nguyen_lieu_id: 4, so_luong_can: 0.40, don_vi_tinh: 'kg', createdAt: new Date(), updatedAt: new Date() }, // Sườn nướng BBQ
  { id: 8, mon_an_id: 15, nguyen_lieu_id: 2, so_luong_can: 0.60, don_vi_tinh: 'kg', createdAt: new Date(), updatedAt: new Date() }  // Tôm hùm Alaska
]);

// 8. Chèn đối tác nhà cung cấp (Suppliers)
db.suppliers.insertMany([
  { id: 1, ma_ncc: 'NCC_WAGYU', ten_ncc: 'Công Ty Nhập Khẩu Thực Phẩm Sạch Wagyu Japan', so_dien_thoai: '0283899999', email: 'contact@wagyuvn.com', dia_chi: '120 Nguyễn Thị Minh Khai, Q.3, TP.HCM', danh_gia_sao: 4.9, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, ma_ncc: 'NCC_SEAFOOD', ten_ncc: 'Vựa Hải Sản Biển Đông Xuất Nhập Khẩu', so_dien_thoai: '0908887766', email: 'sales@haisanbiendong.vn', dia_chi: '45 Cảng Cát Lái, TP.Thủ Đức, TP.HCM', danh_gia_sao: 4.8, createdAt: new Date(), updatedAt: new Date() },
  { id: 3, ma_ncc: 'NCC_ORGANIC', ten_ncc: 'Nông Trại Rau Củ Quả Đà Lạt GAP Organic', so_dien_thoai: '0263388888', email: 'dalatfarm@organic.vn', dia_chi: 'Thung Lũng Tình Yêu, TP.Đà Lạt', danh_gia_sao: 4.7, createdAt: new Date(), updatedAt: new Date() }
]);

// 9. Chèn phiếu đặt bàn trước (Reservations)
db.reservations.insertMany([
  { id: 1, ma_reservation: 'RES-20261027-01', ten_khach: 'Trần Thị Bích', sdt: '0987654321', ban_id: 5, thoi_gian_hen: new Date(Date.now() + 4 * 3600000), so_luong_khach: 6, tien_coc: 500000, trang_thai: 'da_xac_nhan', ghi_chu: 'Tiệc sinh nhật ấm cúng, cần nến và hoa tươi', createdAt: new Date(), updatedAt: new Date() },
  { id: 2, ma_reservation: 'RES-20261027-02', ten_khach: 'Lê Hoàng Nam', sdt: '0933112233', ban_id: 9, thoi_gian_hen: new Date(Date.now() + 6 * 3600000), so_luong_khach: 8, tien_coc: 1000000, trang_thai: 'da_xac_nhan', ghi_chu: 'Tiếp đón đoàn đối tác VIP quốc tế', createdAt: new Date(), updatedAt: new Date() }
]);

// 10. Chèn các đơn gọi món đang phục vụ thực tế (Orders)
db.orders.insertMany([
  { id: 1, ban_id: 2, mon_an_id: 5, khach_hang_id: 1, so_luong: 2, don_gia: 450000, tong_tien: 900000, options_json: '{"do_chin":"Medium Rare","sot":"Tieu den"}', ghi_chu: 'Chế biến ít cay cho phụ nữ', trang_thai: 'dang_che_bien', phuong_thuc_thanh_toan: 'chua_thanh_toan', thu_tu_uu_tien: 1, so_luong_khach: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, ban_id: 2, mon_an_id: 1, khach_hang_id: 1, so_luong: 1, don_gia: 145000, tong_tien: 145000, options_json: '{}', ghi_chu: 'Sốt để chén riêng', trang_thai: 'da_phuc_vu', phuong_thuc_thanh_toan: 'chua_thanh_toan', thu_tu_uu_tien: 2, so_luong_khach: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 3, ban_id: 2, mon_an_id: 27, khach_hang_id: 1, so_luong: 3, don_gia: 50000, tong_tien: 150000, options_json: '{"da":"Ít đá","duong":"70%"}', ghi_chu: 'Mang ra trước', trang_thai: 'da_phuc_vu', phuong_thuc_thanh_toan: 'chua_thanh_toan', thu_tu_uu_tien: 1, so_luong_khach: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 4, ban_id: 4, mon_an_id: 15, khach_hang_id: 3, so_luong: 1, don_gia: 750000, tong_tien: 750000, options_json: '{"phomai":"Gấp đôi"}', ghi_chu: 'Làm nóng hổi', trang_thai: 'dang_che_bien', phuong_thuc_thanh_toan: 'chua_thanh_toan', thu_tu_uu_tien: 1, so_luong_khach: 5, createdAt: new Date(), updatedAt: new Date() },
  { id: 5, ban_id: 4, mon_an_id: 18, khach_hang_id: 3, so_luong: 1, don_gia: 380000, tong_tien: 380000, options_json: '{"cay":"Vừa"}', ghi_chu: 'Thêm rau thơm', trang_thai: 'cho_xac_nhan', phuong_thuc_thanh_toan: 'chua_thanh_toan', thu_tu_uu_tien: 2, so_luong_khach: 5, createdAt: new Date(), updatedAt: new Date() },
  { id: 6, ban_id: 10, mon_an_id: 24, khach_hang_id: 2, so_luong: 2, don_gia: 850000, tong_tien: 1700000, options_json: '{}', ghi_chu: 'Mở nắp vang thở trước 15 phút', trang_thai: 'da_phuc_vu', phuong_thuc_thanh_toan: 'chua_thanh_toan', thu_tu_uu_tien: 1, so_luong_khach: 8, createdAt: new Date(), updatedAt: new Date() }
]);

// 11. Chèn báo cáo doanh thu kết toán ca (Reports)
db.reports.insertMany([
  { id: 1, ma_bao_cao: 'BC-20261026-CA1', ngay_lap: new Date(Date.now() - 86400000), nguoi_lap: 'Trần Thị Mai Phương', ca_lam_viec: 'Ca Sáng (08:00 - 16:00)', tong_so_hoa_don: 24, tong_luong_khach: 86, tong_doanh_thu: 18450000, doanh_thu_tien_mat: 6200000, doanh_thu_chuyen_khoan: 12250000, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, ma_bao_cao: 'BC-20261026-CA2', ngay_lap: new Date(Date.now() - 43200000), nguoi_lap: 'Lê Hoàng Nam', ca_lam_viec: 'Ca Tối (16:00 - 23:00)', tong_so_hoa_don: 38, tong_luong_khach: 142, tong_doanh_thu: 32680000, doanh_thu_tien_mat: 8500000, doanh_thu_chuyen_khoan: 24180000, createdAt: new Date(), updatedAt: new Date() }
]);

// 12. Chèn đánh giá từ thực khách (Reviews)
db.reviews.insertMany([
  { id: 1, ban_id: 2, so_sao: 5, noi_dung_danh_gia: 'Bò Wagyu A5 rất mềm, sốt tiêu đậm đà, nhân viên phục vụ chu đáo lịch thiệp!', canh_bao_do: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: 2, ban_id: 10, so_sao: 5, noi_dung_danh_gia: 'Không gian phòng VIP Hoàng Gia sang trọng, rất thích hợp tiếp khách đối tác lớn.', canh_bao_do: 0, createdAt: new Date(), updatedAt: new Date() }
]);

// 13. Khởi tạo bộ đếm tự tăng (Counters)
db.counters.insertMany([
  { _id: 'user_id', seq: 10 },
  { _id: 'category_id', seq: 6 },
  { _id: 'dish_id', seq: 30 },
  { _id: 'table_id', seq: 20 },
  { _id: 'ingredient_id', seq: 10 },
  { _id: 'dish_ingredient_id', seq: 8 },
  { _id: 'customer_id', seq: 5 },
  { _id: 'supplier_id', seq: 3 },
  { _id: 'reservation_id', seq: 2 },
  { _id: 'order_id', seq: 6 },
  { _id: 'report_id', seq: 2 },
  { _id: 'review_id', seq: 2 }
]);

print(`========================================================`);
print(`🎉 NẠP THÀNH CÔNG DỮ LIỆU CSDL MONGODB CHO ROYAL BISTRO!`);
print(`📊 THỐNG KÊ SỐ LƯỢNG BẢN GHI:`);
print(`   - Users:            ${db.users.countDocuments()} nhân sự`);
print(`   - Categories:       ${db.categories.countDocuments()} danh mục`);
print(`   - Dishes:           ${db.dishes.countDocuments()} món ăn`);
print(`   - Tables:           ${db.tables.countDocuments()} bàn ăn`);
print(`   - Customers:        ${db.customers.countDocuments()} khách hàng VIP`);
print(`   - Orders:           ${db.orders.countDocuments()} đơn gọi món`);
print(`   - Ingredients:      ${db.ingredients.countDocuments()} nguyên liệu kho`);
print(`   - DishIngredients:  ${db.dishingredients.countDocuments()} công thức BOM`);
print(`   - Suppliers:        ${db.suppliers.countDocuments()} nhà cung cấp`);
print(`   - Reservations:     ${db.reservations.countDocuments()} đặt bàn trước`);
print(`   - Reports:          ${db.reports.countDocuments()} báo cáo doanh thu`);
print(`   - Reviews:          ${db.reviews.countDocuments()} đánh giá`);
print(`   - Counters:         ${db.counters.countDocuments()} bộ đếm tuần tự`);
print(`========================================================`);
