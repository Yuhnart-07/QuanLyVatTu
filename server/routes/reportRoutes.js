// =======================================================
// server/routes/reportRoutes.js
// Định tuyến 7 Báo biểu (Reports)
// Tham chiếu: De.md Mục II.2 (2.1 đến 2.7)
// =======================================================

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/', reportController.index);
router.get('/employees', reportController.getEmployeeListReport);
router.get('/materials', reportController.getMaterialListReport);
router.get('/pending-orders', reportController.getPendingOrdersReport);
router.get('/detail-in-out', reportController.getDetailInOutReport);
router.get('/receipt-stats-year', reportController.getReceiptStatsByYearReport);
router.get('/issue-stats-year', reportController.getIssueStatsByYearReport);
router.get('/summary-in-out', reportController.getSummaryInOutReport);

module.exports = router;
