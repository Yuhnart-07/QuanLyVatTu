// =======================================================
// server/routes/issueRoutes.js
// Định tuyến Phiếu xuất hàng (Master-Detail)
// Tham chiếu: De.md Mục II.1.5 & Rule 01, 02, 03
// =======================================================

const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const issueValidator = require('../validators/issueValidator');

router.get('/', issueController.getAll);
router.get('/:id', issueController.getById);
router.post('/', issueValidator.validateCreate, issueController.create);
router.delete('/:id', issueController.delete);

module.exports = router;
