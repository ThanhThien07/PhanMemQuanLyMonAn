import api from './api';

export const orderService = {
  getOrders: (params) => api.get('/orders', { params }),
  getKitchenOrders: () => api.get('/orders/kitchen'),
  createOrder: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { trang_thai: status }),
  payBill: (banId, data) => api.post(`/orders/pay/${banId}`, data)
};

export default orderService;
