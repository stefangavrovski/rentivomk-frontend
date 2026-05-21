export type UserRole = 'Admin' | 'Worker' | 'Customer';
export type VehicleStatus = 'Available' | 'Rented' | 'Maintenance';
export type ReservationStatus = 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'Cancelled';

export interface AuthResponse {
  token: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface UpdateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  role?: UserRole;
}

export interface VehicleDto {
  id: number;
  make: string;
  model: string;
  year: number;
  pricePerDay: number;
  category: string;
  status: VehicleStatus;
  description: string;
  createdAt: string;
}

export interface CreateVehicleDto {
  make: string;
  model: string;
  year: number;
  pricePerDay: number;
  category: string;
  description: string;
}

export interface UpdateVehicleDto extends CreateVehicleDto {
  status?: VehicleStatus;
}

export interface ReservationDto {
  id: number;
  customerId: number;
  customerName: string;
  vehicleId: number;
  vehicleName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReservationDto {
  vehicleId: number;
  startDate: string;
  endDate: string;
}