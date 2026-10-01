// =======================================================
// server/controllers/materialController.js
// Tiếp nhận Request / Response cho Danh mục Vật tư
// Tham chiếu: Rule.md mục 7 & De.md Mục II.1.2
// =======================================================

const materialService = require('../services/materialService');

exports.getAll = async (req, res, next) => {
  try {
    const materials = await materialService.getAllMaterials();
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, data: materials });
    }
    res.render('materials/index', { title: 'Danh mục Vật tư', materials });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const material = await materialService.getMaterialById(req.params.id);
    res.json({ success: true, data: material });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const result = await materialService.createMaterial(req.body);
    res.status(201).json({ success: true, message: 'Thêm vật tư thành công.', data: result });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const result = await materialService.updateMaterial(req.params.id, req.body);
    res.json({ success: true, message: 'Cập nhật vật tư thành công.', data: result });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await materialService.deleteMaterial(req.params.id);
    res.json({ success: true, message: 'Xóa vật tư thành công.' });
  } catch (err) {
    next(err);
  }
};
