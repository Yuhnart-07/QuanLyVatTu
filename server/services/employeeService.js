// =======================================================
// server/services/employeeService.js
// Nghiệp vụ Quản lý Nhân viên & Cơ chế Phục hồi (Undo) 1 bước
// Tham chiếu: Rule.md mục 8 & De.md Mục II.1.1, PhanTichNghiepVu.md UC01
// =======================================================

const employeeRepository = require('../repositories/employeeRepository');

exports.getAllEmployees = async () => {
  return await employeeRepository.getAll();
};

exports.getEmployeeById = async (manv) => {
  const employee = await employeeRepository.getById(manv);
  if (!employee) {
    const error = new Error('Không tìm thấy nhân viên.');
    error.status = 404;
    throw error;
  }
  return employee;
};

exports.createEmployee = async (data, session = null) => {
  const result = await employeeRepository.create(data);

  // Lưu vết phục hồi (Undo) 1 bước gần nhất vào phiên làm việc
  if (session) {
    session.employeeUndoAction = {
      action: 'CREATE',
      description: `Thêm nhân viên ${data.ho} ${data.ten} (Mã: ${data.manv})`,
      data: { manv: parseInt(data.manv, 10) }
    };
  }

  return result;
};

exports.updateEmployee = async (manv, data, session = null) => {
  // Lấy dữ liệu hiện tại trước khi cập nhật để lưu vết Undo
  const oldData = await employeeRepository.getById(manv);
  if (!oldData) {
    const error = new Error('Không tìm thấy nhân viên cần cập nhật.');
    error.status = 404;
    throw error;
  }

  const result = await employeeRepository.update(manv, data);

  // Lưu vết phục hồi (Undo) 1 bước gần nhất vào phiên làm việc
  if (session) {
    session.employeeUndoAction = {
      action: 'UPDATE',
      description: `Cập nhật nhân viên ${oldData.HO} ${oldData.TEN} (Mã: ${manv})`,
      data: {
        manv: parseInt(manv, 10),
        ho: oldData.HO,
        ten: oldData.TEN,
        diachi: oldData.DIACHI,
        ngaysinh: oldData.NGAYSINH,
        luong: oldData.LUONG,
        ghichu: oldData.GHICHU
      }
    };
  }

  return result;
};

exports.deleteEmployee = async (manv, session = null) => {
  // Lấy thông tin đầy đủ trước khi xóa để hỗ trợ phục hồi
  const oldData = await employeeRepository.getById(manv);
  if (!oldData) {
    const error = new Error('Không tìm thấy nhân viên cần xóa.');
    error.status = 404;
    throw error;
  }

  // Thực thi xóa (nếu vướng BR11, SP sẽ ném lỗi 50001 tại đây trước khi ghi nhận Undo)
  await employeeRepository.delete(manv);

  // Lưu vết phục hồi (Undo) 1 bước gần nhất vào phiên làm việc
  if (session) {
    session.employeeUndoAction = {
      action: 'DELETE',
      description: `Xóa nhân viên ${oldData.HO} ${oldData.TEN} (Mã: ${manv})`,
      data: {
        manv: parseInt(oldData.MANV, 10),
        ho: oldData.HO,
        ten: oldData.TEN,
        diachi: oldData.DIACHI,
        ngaysinh: oldData.NGAYSINH,
        luong: oldData.LUONG,
        ghichu: oldData.GHICHU
      }
    };
  }

  return true;
};

exports.undoEmployee = async (session) => {
  if (!session || !session.employeeUndoAction) {
    const error = new Error('Không có thao tác nào để phục hồi.');
    error.status = 400;
    throw error;
  }

  const lastAction = session.employeeUndoAction;
  let undoResult = null;

  switch (lastAction.action) {
    case 'CREATE':
      // Hoàn tác thao tác Thêm mới -> Xóa nhân viên vừa thêm
      await employeeRepository.delete(lastAction.data.manv);
      undoResult = {
        action: 'CREATE',
        message: `Đã hoàn tác: Xóa nhân viên vừa thêm (Mã: ${lastAction.data.manv}).`
      };
      break;

    case 'UPDATE':
      // Hoàn tác thao tác Cập nhật -> Ghi đè lại dữ liệu cũ
      await employeeRepository.update(lastAction.data.manv, lastAction.data);
      undoResult = {
        action: 'UPDATE',
        message: `Đã hoàn tác: Khôi phục thông tin nhân viên ${lastAction.data.ho} ${lastAction.data.ten} (Mã: ${lastAction.data.manv}).`,
        data: lastAction.data
      };
      break;

    case 'DELETE':
      // Hoàn tác thao tác Xóa -> Tạo lại nhân viên đã bị xóa
      await employeeRepository.create(lastAction.data);
      undoResult = {
        action: 'DELETE',
        message: `Đã hoàn tác: Khôi phục lại nhân viên đã xóa ${lastAction.data.ho} ${lastAction.data.ten} (Mã: ${lastAction.data.manv}).`,
        data: lastAction.data
      };
      break;

    default: {
      const error = new Error('Hành động phục hồi không hợp lệ.');
      error.status = 400;
      throw error;
    }
  }

  // Xóa trạng thái Undo khỏi session sau khi hoàn tác thành công (đúng quy tắc 1 bước)
  session.employeeUndoAction = null;

  return undoResult;
};

exports.getUndoState = (session) => {
  if (session && session.employeeUndoAction) {
    return {
      canUndo: true,
      lastAction: {
        action: session.employeeUndoAction.action,
        description: session.employeeUndoAction.description
      }
    };
  }
  return {
    canUndo: false,
    lastAction: null
  };
};
