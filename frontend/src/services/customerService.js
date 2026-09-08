import api from './api';

export const customerService = {
  getCustomers: (params) => api.get('/customers', { params }),
  createCustomer: (data) => api.post('/customers', data)
};

export default customerService;
