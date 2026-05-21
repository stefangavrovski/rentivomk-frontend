import api from './axios';
import type { ReservationDto, CreateReservationDto } from '../types';

export const reservationApi = {
  // Customer
  getMy: () => api.get<ReservationDto[]>('/reservations/my'),
  getById: (id: number) => api.get<ReservationDto>(`/reservations/${id}`),
  create: (dto: CreateReservationDto) => api.post<ReservationDto>('/reservations', dto),
  cancel: (id: number) => api.put(`/reservations/${id}/cancel`),

  // Admin / Worker
  getAll: () => api.get<ReservationDto[]>('/reservations'),
  approve: (id: number) => api.put(`/reservations/${id}/approve`),
  reject: (id: number) => api.put(`/reservations/${id}/reject`),
  complete: (id: number) => api.put(`/reservations/${id}/complete`),
  adminCancel: (id: number) => api.put(`/reservations/${id}/cancel`),
};