// =======================================================
// server/routes/orderRoutes.js
// Định tuyến Đơn đặt hàng (Master-Detail)
// Tham chiếu: De.md Mục II.1.3 & Rule 01, 02, 03
// =======================================================

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const orderValidator = require('../validators/orderValidator');

router.get('/', orderController.getAll);
router.get('/:id', orderController.getById);
router.post('/', orderValidator.validateCreate, orderController.create);
router.put('/:id', orderValidator.validateUpdate, orderController.update);
router.delete('/:id', orderController.delete);

module.exports = router;
