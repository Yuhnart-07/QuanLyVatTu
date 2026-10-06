// =======================================================
// server/routes/employeeRoutes.js
// Định tuyến quản lý Nhân viên (Thêm, Xóa, Ghi, Tìm kiếm, Phục hồi Undo)
// Tham chiếu: De.md Mục II.1.1, Rule.md mục 5
// =======================================================

const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const employeeValidator = require('../validators/employeeValidator');

// 1. Route danh sách & trạng thái Undo
router.get('/', employeeController.getAll);
router.get('/undo-state', employeeController.getUndoState);
router.post('/undo', employeeController.undo);

// 2. Route chi tiết theo mã MANV
router.get('/:id', employeeController.getById);

// 3. Route Thêm mới (qua Validator Lớp 2)
router.post('/', employeeValidator.validateCreate, employeeController.create);

// 4. Route Cập nhật (qua Validator Lớp 2)
router.put('/:id', employeeValidator.validateUpdate, employeeController.update);

// 5. Route Xóa nhân viên
router.delete('/:id', employeeController.delete);

module.exports = router;
