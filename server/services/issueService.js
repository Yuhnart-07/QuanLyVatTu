// =======================================================
// server/services/issueService.js
// Nghiệp vụ Phiếu xuất hàng (Master-Detail)
// Tham chiếu: Rule 01, 02, 03 & Rule.md mục 8
// =======================================================

const issueRepository = require('../repositories/issueRepository');

exports.getAllIssues = async () => {
  return await issueRepository.getAll();
};

exports.getIssueById = async (mapx) => {
  const issue = await issueRepository.getById(mapx);
  if (!issue) {
    const error = new Error('Không tìm thấy phiếu xuất.');
    error.status = 404;
    throw error;
  }
  return issue;
};

exports.createIssue = async ({ mapx, hotenkh, manv, details }) => {
  return await issueRepository.create({ mapx, hotenkh, manv, details });
};

exports.deleteIssue = async (mapx) => {
  return await issueRepository.delete(mapx);
};
