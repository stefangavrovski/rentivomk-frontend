import { vehicleApi } from './vehicles';
import { reservationApi } from './reservations';
import { userApi } from './users';
import type { VehicleDto, ReservationDto, UserDto } from '../types';

export interface DashboardData {
  vehicles: VehicleDto[];
  reservations: ReservationDto[];
  users: UserDto[];
}

export async function fetchAdminDashboard(): Promise<DashboardData> {
  const [vehiclesRes, reservationsRes, usersRes] = await Promise.all([
    vehicleApi.getAll(),
    reservationApi.getAll(),
    userApi.getAll(),
  ]);
  return {
    vehicles: vehiclesRes.data,
    reservations: reservationsRes.data,
    users: usersRes.data,
  };
}

export async function fetchWorkerDashboard(): Promise<Omit<DashboardData, 'users'>> {
  const [vehiclesRes, reservationsRes] = await Promise.all([
    vehicleApi.getAll(),
    reservationApi.getAll(),
  ]);
  return {
    vehicles: vehiclesRes.data,
    reservations: reservationsRes.data,
  };
}

export async function fetchCustomerDashboard(): Promise<{ reservations: ReservationDto[] }> {
  const reservationsRes = await reservationApi.getMy();
  return { reservations: reservationsRes.data };
}