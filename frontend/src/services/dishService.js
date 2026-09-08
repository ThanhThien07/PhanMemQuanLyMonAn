import api from './api';

export const dishService = {
  getCategories: () => api.get('/dishes/categories'),
  getDishes: (params) => api.get('/dishes', { params }),
  getDishById: (id) => api.get(`/dishes/${id}`),
  createDish: (data) => api.post('/dishes', data),
  updateDish: (id, data) => api.put(`/dishes/${id}`, data),
  deleteDish: (id) => api.delete(`/dishes/${id}`)
};

export default dishService;
