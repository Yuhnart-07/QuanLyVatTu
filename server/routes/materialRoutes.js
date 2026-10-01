// =======================================================
// server/routes/materialRoutes.js
// Định tuyến danh mục Vật tư (Thêm, Xóa, Ghi, Tìm kiếm)
// Tham chiếu: De.md Mục II.1.2
// =======================================================

const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const materialValidator = require('../validators/materialValidator');

router.get('/', materialController.getAll);
router.get('/:id', materialController.getById);
router.post('/', materialValidator.validateCreate, materialController.create);
router.put('/:id', materialValidator.validateUpdate, materialController.update);
router.delete('/:id', materialController.delete);

module.exports = router;
