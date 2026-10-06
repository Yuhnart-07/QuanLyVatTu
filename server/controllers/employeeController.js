// =======================================================
// server/controllers/employeeController.js
// Tiếp nhận Request / Response cho Nhân viên & Logic Undo
// Tham chiếu: Rule.md mục 7 & De.md Mục II.1.1
// =======================================================

const employeeService = require('../services/employeeService');

exports.getAll = async (req, res, next) => {
  try {
    const employees = await employeeService.getAllEmployees();
    const undoState = employeeService.getUndoState(req.session);

    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({
        success: true,
        data: employees,
        undoState
      });
    }

    res.render('employees/index', {
      title: 'Quản lý Nhân viên - QLVT ERP',
      employees,
      undoState
    });
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
    const result = await employeeService.createEmployee(req.body, req.session);
    res.status(201).json({
      success: true,
      message: `Thêm nhân viên ${result.ho} ${result.ten} (Mã: ${result.manv}) thành công.`,
      data: result,
      undoState: employeeService.getUndoState(req.session)
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const result = await employeeService.updateEmployee(req.params.id, req.body, req.session);
    res.json({
      success: true,
      message: `Cập nhật thông tin nhân viên ${result.ho} ${result.ten} (Mã: ${result.manv}) thành công.`,
      data: result,
      undoState: employeeService.getUndoState(req.session)
    });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await employeeService.deleteEmployee(req.params.id, req.session);
    res.json({
      success: true,
      message: `Đã xóa nhân viên có mã ${req.params.id} thành công.`,
      undoState: employeeService.getUndoState(req.session)
    });
  } catch (err) {
    next(err);
  }
};

exports.undo = async (req, res, next) => {
  try {
    const result = await employeeService.undoEmployee(req.session);
    res.json({
      success: true,
      message: result.message,
      data: result,
      undoState: employeeService.getUndoState(req.session)
    });
  } catch (err) {
    next(err);
  }
};

exports.getUndoState = async (req, res, next) => {
  try {
    const undoState = employeeService.getUndoState(req.session);
    res.json({ success: true, data: undoState });
  } catch (err) {
    next(err);
  }
};
