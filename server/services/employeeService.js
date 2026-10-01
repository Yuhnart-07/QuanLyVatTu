// =======================================================
// server/services/employeeService.js
// Nghiệp vụ Quản lý Nhân viên
// Tham chiếu: Rule.md mục 8 & De.md Mục II.1.1
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

exports.createEmployee = async (data) => {
  return await employeeRepository.create(data);
};

exports.updateEmployee = async (manv, data) => {
  return await employeeRepository.update(manv, data);
};

exports.deleteEmployee = async (manv) => {
  return await employeeRepository.delete(manv);
};
