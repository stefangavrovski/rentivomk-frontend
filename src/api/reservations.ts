import api from './axios';
import type { ReservationDto, CreateReservationDto } from '../types';

export const reservationApi = {
  getMy: () => api.get<ReservationDto[]>('/reservations/my'),
  getById: (id: number) => api.get<ReservationDto>(`/reservations/${id}`),
  create: (dto: CreateReservationDto) => api.post<ReservationDto>('/reservations', dto),
  cancel: (id: number) => api.put(`/reservations/${id}/cancel`),
};
