import api from './axios';
import type { UserDto, UpdateUserDto } from '../types';

export const userApi = {
  getAll: () => api.get<UserDto[]>('/users'),
  getById: (id: number) => api.get<UserDto>(`/users/${id}`),
  update: (id: number, dto: UpdateUserDto) => api.put(`/users/${id}`, dto),
  delete: (id: number) => api.delete(`/users/${id}`),
};
