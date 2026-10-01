// =======================================================
// server/routes/employeeRoutes.js
// Định tuyến quản lý Nhân viên (Thêm, Xóa, Ghi, Tìm kiếm)
// Tham chiếu: De.md Mục II.1.1
// =======================================================

const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const employeeValidator = require('../validators/employeeValidator');

router.get('/', employeeController.getAll);
router.get('/:id', employeeController.getById);
router.post('/', employeeValidator.validateCreate, employeeController.create);
router.put('/:id', employeeValidator.validateUpdate, employeeController.update);
router.delete('/:id', employeeController.delete);

module.exports = router;
