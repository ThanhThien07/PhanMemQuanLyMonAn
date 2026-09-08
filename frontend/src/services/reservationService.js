import api from './api';

export const reservationService = {
  getReservations: (params) => api.get('/reservations', { params }),
  createReservation: (data) => api.post('/reservations', data),
  checkin: (id) => api.patch(`/reservations/${id}/checkin`),
  cancel: (id) => api.patch(`/reservations/${id}/cancel`)
};

export default reservationService;
