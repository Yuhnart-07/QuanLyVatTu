// ====================================================================================
// DỰ ÁN QUẢN LÝ NHẬP/XUẤT VẬT TƯ (QLVT)
// File: server/services/adminService.js
// Mô tả: Tầng nghiệp vụ (Business Logic) cho Quản trị hệ thống (Mục 3.1 & 3.2).
//         Điều phối luồng xử lý dữ liệu và kiểm tra các ràng buộc an toàn nghiệp vụ.
// Tham chiếu: Rule.md mục 8, De.md Mục II.3
// ====================================================================================

const adminRepository = require('../repositories/adminRepository');

/**
 * Lấy danh sách toàn bộ nhân viên kèm trạng thái tài khoản Login
 * @returns {Promise<Array>}
 */
exports.getAllLogins = async () => {
  return await adminRepository.getAllLogins();
};

/**
 * Tạo Login SQL Server theo đúng 5 bước chuẩn
 * @param {Object} data { manv, username, password, role }
 * @returns {Promise<boolean>}
 */
exports.createLogin = async (data) => {
  return await adminRepository.createLogin(data);
};

/**
 * Xóa Login SQL Server và thu hồi các quyền liên kết
 * Kiểm tra an toàn: Người dùng không được phép tự xóa tài khoản của chính mình trong phiên làm việc hiện tại
 * @param {string} username - Tên đăng nhập cần xóa
 * @param {Object} currentLoggedInUser - Thông tin tài khoản đang thực hiện thao tác (từ req.user)
 * @returns {Promise<boolean>}
 */
exports.deleteLogin = async (username, currentLoggedInUser) => {
  // Kiểm tra an toàn tầng Service: Ngăn chặn tự xóa tài khoản đang đăng nhập
  if (currentLoggedInUser && currentLoggedInUser.username) {
    if (currentLoggedInUser.username.trim().toLowerCase() === username.trim().toLowerCase()) {
      const error = new Error('Không được phép tự xóa tài khoản đang đăng nhập.');
      error.status = 400;
      throw error;
    }
  }

  return await adminRepository.deleteLogin(username);
};

/**
 * Lấy lịch sử các bản sao lưu cơ sở dữ liệu
 * @returns {Promise<Array>}
 */
exports.getBackupHistory = async () => {
  return await adminRepository.getBackupHistory();
};

/**
 * Thực hiện sao lưu CSDL
 * @param {boolean} resetFile
 * @returns {Promise<boolean>}
 */
exports.backupDatabase = async (resetFile) => {
  return await adminRepository.backupDatabase(resetFile);
};

/**
 * Thực hiện phục hồi CSDL
 * @param {number} position
 * @returns {Promise<boolean>}
 */
exports.restoreDatabase = async (position) => {
  return await adminRepository.restoreDatabase(position);
};
