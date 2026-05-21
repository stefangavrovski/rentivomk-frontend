import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { vehicleApi } from '../api/vehicles';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import type { VehicleDto, CreateVehicleDto, UpdateVehicleDto } from '../types';
import PageHeader from '../components/layout/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import VehicleFormModal from '../components/vehicles/VehicleFormModal';

type FilterTab = 'all' | 'available';

export default function VehiclesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'Admin';

  const initialFilter = searchParams.get('filter') === 'available' ? 'available' : 'all';
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [filter, setFilter] = useState<FilterTab>(initialFilter);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<VehicleDto | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<VehicleDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = filter === 'available'
        ? await vehicleApi.getAvailable()
        : await vehicleApi.getAll();
      setVehicles(res.data);
    } catch {
      setError('Failed to load vehicles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSearchParams(filter === 'available' ? { filter: 'available' } : {}, { replace: true });
    fetchVehicles();
  }, [filter]);

  const handleCreate = async (data: CreateVehicleDto | UpdateVehicleDto) => {
    await vehicleApi.create(data as CreateVehicleDto);
    await fetchVehicles();
    showToast('Vehicle added successfully.');
  };

  const handleUpdate = async (data: CreateVehicleDto | UpdateVehicleDto) => {
    if (!editTarget) return;
    await vehicleApi.update(editTarget.id, data as UpdateVehicleDto);
    await fetchVehicles();
    showToast('Vehicle updated successfully.');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await vehicleApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      await fetchVehicles();
      showToast('Vehicle deleted.');
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to delete vehicle.');
      setDeleteTarget(null);
      showToast(err.response?.data?.error ?? 'Failed to delete vehicle.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEdit = (v: VehicleDto) => { setEditTarget(v); setShowForm(true); };
  const openCreate = () => { setEditTarget(undefined); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditTarget(undefined); };

  return (
    <div>
      <PageHeader
        title="Vehicles"
        subtitle="Browse the full fleet or filter available cars"
        action={
          isAdmin ? (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors shadow-lg shadow-amber-500/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Vehicle
            </button>
          ) : undefined
        }
      />

      <div className="flex gap-1 mb-6 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
        {(['all', 'available'] as FilterTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === tab ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'all' ? 'All Vehicles' : 'Available Only'}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-slate-800 rounded w-2/3 mb-3" />
              <div className="h-3 bg-slate-800 rounded w-1/2 mb-6" />
              <div className="h-3 bg-slate-800 rounded w-full mb-2" />
              <div className="h-3 bg-slate-800 rounded w-4/5" />
            </div>
          ))}
        </div>
      )}

      {!loading && vehicles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-1.5-4.5a1 1 0 00-.95-.5H7.45a1 1 0 00-.95.5L5 9M3 12v6a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-6M3 12h18" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">No vehicles found</p>
          <p className="text-slate-600 text-sm mt-1">
            {filter === 'available' ? 'No vehicles are currently available.' : 'No vehicles have been added yet.'}
          </p>
        </div>
      )}

      {!loading && vehicles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {vehicles.map(v => (
            <div key={v.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold text-base">{v.make} {v.model}</h3>
                  <p className="text-slate-500 text-sm">{v.year} · {v.category}</p>
                </div>
                <StatusBadge status={v.status} />
              </div>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{v.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div>
                  <span className="text-amber-400 font-bold text-lg">€{v.pricePerDay}</span>
                  <span className="text-slate-500 text-sm"> / day</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => navigate(`/vehicles/${v.id}`)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all">
                    Details
                  </button>
                  {isAdmin && (
                    <>
                      <button onClick={() => openEdit(v)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border border-slate-700 hover:border-amber-500/30 transition-all">
                        Edit
                      </button>
                      <button onClick={() => setDeleteTarget(v)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 transition-all">
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <VehicleFormModal vehicle={editTarget} onSubmit={editTarget ? handleUpdate : handleCreate} onClose={closeForm} />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Vehicle"
          message={`Are you sure you want to delete ${deleteTarget.make} ${deleteTarget.model}? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}