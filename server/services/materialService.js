// =======================================================
// server/services/materialService.js
// Nghiệp vụ Danh mục Vật tư
// Tham chiếu: Rule.md mục 8 & De.md Mục II.1.2
// =======================================================

const materialRepository = require('../repositories/materialRepository');

exports.getAllMaterials = async () => {
  return await materialRepository.getAll();
};

exports.getMaterialById = async (mavt) => {
  const material = await materialRepository.getById(mavt);
  if (!material) {
    const error = new Error('Không tìm thấy vật tư.');
    error.status = 404;
    throw error;
  }
  return material;
};

exports.createMaterial = async (data) => {
  return await materialRepository.create(data);
};

exports.updateMaterial = async (mavt, data) => {
  return await materialRepository.update(mavt, data);
};

exports.deleteMaterial = async (mavt) => {
  return await materialRepository.delete(mavt);
};
