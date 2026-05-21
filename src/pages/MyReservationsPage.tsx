import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationApi } from '../api/reservations';
import type { ReservationDto } from '../types';
import PageHeader from '../components/layout/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function MyReservationsPage() {
  const navigate = useNavigate();

  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelTarget, setCancelTarget] = useState<ReservationDto | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reservationApi.getMy();
      // Most recent first
      setReservations(res.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {
      setError('Failed to load your reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await reservationApi.cancel(cancelTarget.id);
      setCancelTarget(null);
      await fetchReservations();
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to cancel reservation.');
      setCancelTarget(null);
    } finally {
      setCancelLoading(false);
    }
  };

  const canCancel = (r: ReservationDto) =>
    r.status === 'Pending' || r.status === 'Approved';

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div>
      <PageHeader
        title="My Reservations"
        subtitle="Track and manage your vehicle reservations"
        action={
          <button
            onClick={() => navigate('/vehicles?filter=available')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors shadow-lg shadow-amber-500/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Reservation
          </button>
        }
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div className="h-4 bg-slate-800 rounded w-1/3" />
                <div className="h-5 bg-slate-800 rounded-full w-20" />
              </div>
              <div className="h-3 bg-slate-800 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-800 rounded w-1/4" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && reservations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">No reservations yet</p>
          <p className="text-slate-600 text-sm mt-1 mb-6">Browse available vehicles and make your first reservation.</p>
          <button
            onClick={() => navigate('/vehicles')}
            className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors"
          >
            Browse Vehicles
          </button>
        </div>
      )}

      {/* Reservations list */}
      {!loading && reservations.length > 0 && (
        <div className="space-y-3">
          {reservations.map(r => (
            <div
              key={r.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: vehicle + dates */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold text-base truncate">{r.vehicleName}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(r.startDate)} → {formatDate(r.endDate)}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-amber-400 font-medium">€{r.totalPrice.toFixed(2)}</span>
                  </div>
                  <p className="text-slate-600 text-xs mt-1.5">
                    Submitted {formatDate(r.createdAt)}
                  </p>
                </div>

                {/* Right: status + actions */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <StatusBadge status={r.status} />
                  {canCancel(r) && (
                    <button
                      onClick={() => setCancelTarget(r)}
                      className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {cancelTarget && (
        <ConfirmDialog
          title="Cancel Reservation"
          message={`Are you sure you want to cancel your reservation for ${cancelTarget.vehicleName}? This cannot be undone.`}
          confirmLabel="Cancel Reservation"
          onConfirm={handleCancel}
          onCancel={() => setCancelTarget(null)}
          loading={cancelLoading}
        />
      )}
    </div>
  );
}