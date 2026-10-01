// =======================================================
// server/routes/receiptRoutes.js
// Định tuyến Phiếu nhập hàng (Master-Detail)
// Tham chiếu: De.md Mục II.1.4 & Rule 01, 02, 03
// =======================================================

const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');
const receiptValidator = require('../validators/receiptValidator');

router.get('/', receiptController.getAll);
router.get('/:id', receiptController.getById);
router.post('/', receiptValidator.validateCreate, receiptController.create);
router.delete('/:id', receiptController.delete);

module.exports = router;
