/**
 * @file moHinhDuLieu.js
 * @description Tập hợp và xuất khẩu toàn bộ các Mô hình Lược đồ Cơ sở Dữ liệu (MongoDB Mongoose Models)
 * phục vụ cho bài toán quản lý nhà hàng Royal Bistro.
 * @module models/moHinhDuLieu
 * @author Nhóm 5 - Nguyễn Ngọc Hà Thảo
 */

import NguoiDung, { User } from './NguoiDung.js';
import LoaiMon, { Category } from './LoaiMon.js';
import MonAn, { Dish } from './MonAn.js';
import BanAn, { Table } from './BanAn.js';
import DatMon, { Order } from './DatMon.js';
import NguyenLieu, { Ingredient } from './NguyenLieu.js';
import MonAnNguyenLieu, { DishIngredient } from './MonAnNguyenLieu.js';
import NhaCungCap, { Supplier } from './NhaCungCap.js';
import DatBanTruoc, { Reservation } from './DatBanTruoc.js';
import KhachHang, { Customer } from './KhachHang.js';
import BaoCao, { Report } from './BaoCao.js';
import DanhGia, { Review } from './DanhGia.js';
import BoDem, { Counter, layMaSoTiepTheo, getNextSequence } from './BoDem.js';

export {
  NguoiDung,
  LoaiMon,
  MonAn,
  BanAn,
  DatMon,
  NguyenLieu,
  MonAnNguyenLieu,
  NhaCungCap,
  DatBanTruoc,
  KhachHang,
  BaoCao,
  DanhGia,
  BoDem,
  layMaSoTiepTheo,
  // Bí danh tương thích
  User,
  Category,
  Dish,
  Table,
  Order,
  Ingredient,
  DishIngredient,
  Supplier,
  Reservation,
  Customer,
  Report,
  Review,
  Counter,
  getNextSequence
};

export default {
  NguoiDung,
  LoaiMon,
  MonAn,
  BanAn,
  DatMon,
  NguyenLieu,
  MonAnNguyenLieu,
  NhaCungCap,
  DatBanTruoc,
  KhachHang,
  BaoCao,
  DanhGia,
  BoDem,
  layMaSoTiepTheo,
  User,
  Category,
  Dish,
  Table,
  Order,
  Ingredient,
  DishIngredient,
  Supplier,
  Reservation,
  Customer,
  Report,
  Review,
  Counter,
  getNextSequence
};
