import api from './axios';
import type { VehicleDto, CreateVehicleDto, UpdateVehicleDto } from '../types';

export const vehicleApi = {
  getAll: () => api.get<VehicleDto[]>('/vehicles'),
  getAvailable: () => api.get<VehicleDto[]>('/vehicles/available'),
  getById: (id: number) => api.get<VehicleDto>(`/vehicles/${id}`),
  create: (dto: CreateVehicleDto) => api.post<VehicleDto>('/vehicles', dto),
  update: (id: number, dto: UpdateVehicleDto) => api.put(`/vehicles/${id}`, dto),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
};