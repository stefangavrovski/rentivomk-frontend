import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleApi } from '../api/vehicles';
import { useAuth } from '../hooks/useAuth';
import type { VehicleDto } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import PageHeader from '../components/layout/PageHeader';

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCustomer = user?.role === 'Customer';

  const [vehicle, setVehicle] = useState<VehicleDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    vehicleApi.getById(Number(id))
      .then(res => setVehicle(res.data))
      .catch(() => setError('Vehicle not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 max-w-2xl">
        <div className="h-8 bg-slate-800 rounded w-1/2" />
        <div className="h-4 bg-slate-800 rounded w-1/3" />
        <div className="h-40 bg-slate-900 border border-slate-800 rounded-2xl mt-6" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-slate-400 font-medium">Vehicle not found</p>
        <button onClick={() => navigate('/vehicles')} className="mt-4 text-amber-400 hover:text-amber-300 text-sm transition-colors">
          ← Back to Vehicles
        </button>
      </div>
    );
  }

  const detail = (label: string, value: string | number) => (
    <div className="flex flex-col gap-1">
      <span className="text-slate-500 text-xs uppercase tracking-wider">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`${vehicle.make} ${vehicle.model}`}
        subtitle={`${vehicle.year} · ${vehicle.category}`}
        action={
          <button
            onClick={() => navigate('/vehicles')}
            className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        }
      />

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        {/* Status + Price */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-amber-400 font-bold text-3xl">€{vehicle.pricePerDay}</span>
            <span className="text-slate-500 text-sm"> / day</span>
          </div>
          <StatusBadge status={vehicle.status} />
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-6">
          {detail('Make', vehicle.make)}
          {detail('Model', vehicle.model)}
          {detail('Year', vehicle.year)}
          {detail('Category', vehicle.category)}
          {detail('Price per day', `€${vehicle.pricePerDay}`)}
          {detail('Added', new Date(vehicle.createdAt).toLocaleDateString())}
        </div>

        {/* Description */}
        <div className="pt-2 border-t border-slate-800">
          <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Description</p>
          <p className="text-slate-300 text-sm leading-relaxed">{vehicle.description}</p>
        </div>

        {/* Reserve CTA for customers */}
        {isCustomer && vehicle.status === 'Available' && (
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => navigate(`/reservations/new?vehicleId=${vehicle.id}`)}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors shadow-lg shadow-amber-500/20"
            >
              Reserve This Vehicle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}