import api from './api';

export const inventoryService = {
  getIngredients: (params) => api.get('/inventory/ingredients', { params }),
  createIngredient: (data) => api.post('/inventory/ingredients', data),
  updateStock: (id, amount, action = 'add') => api.patch(`/inventory/ingredients/${id}/stock`, { amount, action }),
  getSuppliers: () => api.get('/inventory/suppliers')
};

export default inventoryService;
