import api from './api';

export const reportService = {
  getSummary: () => api.get('/reports/summary')
};

export default reportService;
