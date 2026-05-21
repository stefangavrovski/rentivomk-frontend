import { useEffect, useState } from 'react';
import { reservationApi } from '../api/reservations';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import type { ReservationDto, ReservationStatus } from '../types';
import PageHeader from '../components/layout/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import ConfirmDialog from '../components/ui/ConfirmDialog';

type FilterStatus = 'All' | ReservationStatus;
type PendingAction = { type: 'approve' | 'reject' | 'complete' | 'cancel'; reservation: ReservationDto };
const STATUS_FILTERS: FilterStatus[] = ['All', 'Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'];

const ACTION_CONFIG = {
  approve:  { label: 'Approve',  confirmLabel: 'Approve',  title: 'Approve Reservation',  message: (r: ReservationDto) => `Approve the reservation for ${r.vehicleName} by ${r.customerName}?` },
  reject:   { label: 'Reject',   confirmLabel: 'Reject',   title: 'Reject Reservation',   message: (r: ReservationDto) => `Reject the reservation for ${r.vehicleName} by ${r.customerName}?` },
  complete: { label: 'Complete', confirmLabel: 'Complete', title: 'Complete Reservation',  message: (r: ReservationDto) => `Mark the reservation for ${r.vehicleName} as completed?` },
  cancel:   { label: 'Cancel',   confirmLabel: 'Cancel',   title: 'Cancel Reservation',   message: (r: ReservationDto) => `Cancel the reservation for ${r.vehicleName} by ${r.customerName}?` },
};

const ACTION_SUCCESS: Record<string, string> = {
  approve:  'Reservation approved.',
  reject:   'Reservation rejected.',
  complete: 'Reservation marked as completed.',
  cancel:   'Reservation cancelled.',
};

export default function ReservationsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isAdmin = user?.role === 'Admin';

  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reservationApi.getAll();
      setReservations(res.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {
      setError('Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleAction = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    try {
      const { type, reservation } = pendingAction;
      if (type === 'approve')  await reservationApi.approve(reservation.id);
      if (type === 'reject')   await reservationApi.reject(reservation.id);
      if (type === 'complete') await reservationApi.complete(reservation.id);
      if (type === 'cancel')   await reservationApi.adminCancel(reservation.id);
      setPendingAction(null);
      await fetchReservations();
      showToast(ACTION_SUCCESS[type]);
    } catch (err: any) {
      const msg = err.response?.data?.error ?? 'Action failed. Please try again.';
      setError(msg);
      setPendingAction(null);
      showToast(msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getAvailableActions = (r: ReservationDto): PendingAction['type'][] => {
    switch (r.status) {
      case 'Pending':  return isAdmin ? ['approve', 'reject', 'cancel'] : ['approve', 'reject'];
      case 'Approved': return ['complete', 'cancel'];
      default:         return [];
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const filtered = reservations.filter(r => {
    const matchesStatus = filter === 'All' || r.status === filter;
    const q = search.toLowerCase();
    const matchesSearch = !q || r.customerName.toLowerCase().includes(q) || r.vehicleName.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const counts = {
    Pending:   reservations.filter(r => r.status === 'Pending').length,
    Approved:  reservations.filter(r => r.status === 'Approved').length,
    Completed: reservations.filter(r => r.status === 'Completed').length,
    Cancelled: reservations.filter(r => r.status === 'Cancelled').length,
  };

  const summaryCards = [
    { label: 'Pending',   value: counts.Pending,   color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { label: 'Approved',  value: counts.Approved,  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Completed', value: counts.Completed, color: 'text-slate-300',   bg: 'bg-slate-700/40 border-slate-700' },
    { label: 'Cancelled', value: counts.Cancelled, color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
  ];

  return (
    <div>
      <PageHeader title="Reservations" subtitle="Manage all customer reservations" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {summaryCards.map(card => (
          <button
            key={card.label}
            onClick={() => setFilter(filter === card.label as FilterStatus ? 'All' : card.label as FilterStatus)}
            className={`rounded-xl border px-4 py-3 text-left transition-all hover:scale-[1.02] ${card.bg} ${filter === card.label ? 'ring-2 ring-amber-500/50' : ''}`}
          >
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-slate-400 text-xs mt-0.5">{card.label}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 flex-wrap">
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === s ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search by customer or vehicle..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition" />
        </div>
      </div>

      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div className="space-y-2 flex-1"><div className="h-4 bg-slate-800 rounded w-1/3" /><div className="h-3 bg-slate-800 rounded w-1/4" /></div>
                <div className="h-5 bg-slate-800 rounded-full w-20" />
              </div>
              <div className="h-3 bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">No reservations found</p>
          <p className="text-slate-600 text-sm mt-1">{filter !== 'All' || search ? 'Try adjusting your filters.' : 'No reservations have been made yet.'}</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map(r => {
            const actions = getAvailableActions(r);
            return (
              <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-white font-semibold text-base">{r.vehicleName}</h3>
                      <span className="text-slate-600 text-sm">·</span>
                      <span className="text-slate-400 text-sm">{r.customerName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(r.startDate)} → {formatDate(r.endDate)}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-amber-400 font-medium">€{r.totalPrice.toFixed(2)}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-500 text-xs">#{r.id}</span>
                    </div>
                    <p className="text-slate-600 text-xs mt-1.5">
                      Submitted {formatDate(r.createdAt)}
                      {r.updatedAt !== r.createdAt && ` · Updated ${formatDate(r.updatedAt)}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={r.status} />
                    {actions.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {actions.map(action => (
                          <button key={action} onClick={() => setPendingAction({ type: action, reservation: r })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                              action === 'approve' ? 'text-emerald-400 hover:bg-emerald-500/10 border-slate-700 hover:border-emerald-500/30'
                              : action === 'complete' ? 'text-blue-400 hover:bg-blue-500/10 border-slate-700 hover:border-blue-500/30'
                              : 'text-red-400 hover:bg-red-500/10 border-slate-700 hover:border-red-500/30'
                            }`}>
                            {ACTION_CONFIG[action].label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pendingAction && (
        <ConfirmDialog
          title={ACTION_CONFIG[pendingAction.type].title}
          message={ACTION_CONFIG[pendingAction.type].message(pendingAction.reservation)}
          confirmLabel={ACTION_CONFIG[pendingAction.type].confirmLabel}
          onConfirm={handleAction}
          onCancel={() => setPendingAction(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}