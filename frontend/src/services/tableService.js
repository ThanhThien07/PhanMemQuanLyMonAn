import api from './api';

export const tableService = {
  getTables: (params) => api.get('/tables', { params }),
  createTable: (data) => api.post('/tables', data),
  updateStatus: (id, data) => api.patch(`/tables/${id}/status`, data)
};

export default tableService;
