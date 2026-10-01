// =======================================================
// server/controllers/employeeController.js
// Tiếp nhận Request / Response cho Nhân viên
// Tham chiếu: Rule.md mục 7 & De.md Mục II.1.1
// =======================================================

const employeeService = require('../services/employeeService');

exports.getAll = async (req, res, next) => {
  try {
    const employees = await employeeService.getAllEmployees();
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, data: employees });
    }
    res.render('employees/index', { title: 'Quản lý Nhân viên', employees });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const result = await employeeService.createEmployee(req.body);
    res.status(201).json({ success: true, message: 'Thêm nhân viên thành công.', data: result });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const result = await employeeService.updateEmployee(req.params.id, req.body);
    res.json({ success: true, message: 'Cập nhật nhân viên thành công.', data: result });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await employeeService.deleteEmployee(req.params.id);
    res.json({ success: true, message: 'Xóa nhân viên thành công.' });
  } catch (err) {
    next(err);
  }
};
