import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  fetchAdminDashboard,
  fetchWorkerDashboard,
  fetchCustomerDashboard,
} from '../api/dashboard';
import type { VehicleDto, ReservationDto, UserDto } from '../types';
import StatusBadge from '../components/ui/StatusBadge';

interface Stats {
  vehicles: VehicleDto[];
  reservations: ReservationDto[];
  users: UserDto[];
  loaded: boolean;
  error: string;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

function StatCard({
  label,
  value,
  color,
  bg,
  icon,
  onClick,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border px-5 py-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg w-full ${bg}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg} border`}>
          {icon}
        </div>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-slate-400 text-sm mt-0.5">{label}</p>
    </button>
  );
}

function QuickAction({
  label,
  description,
  icon,
  onClick,
  accent,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  accent: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 hover:border-slate-700 hover:bg-slate-800/60 transition-all group text-left"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-white font-semibold text-sm">{label}</p>
        <p className="text-slate-500 text-xs mt-0.5">{description}</p>
      </div>
      <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-400 ml-auto transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4 animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-slate-800 mb-3" />
      <div className="h-8 bg-slate-800 rounded w-16 mb-1.5" />
      <div className="h-3 bg-slate-800 rounded w-24" />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? 'Customer';

  const [stats, setStats] = useState<Stats>({
    vehicles: [],
    reservations: [],
    users: [],
    loaded: false,
    error: '',
  });

  useEffect(() => {
    (async () => {
      try {
        if (role === 'Admin') {
          const data = await fetchAdminDashboard();
          setStats({ ...data, loaded: true, error: '' });
        } else if (role === 'Worker') {
          const data = await fetchWorkerDashboard();
          setStats({ ...data, users: [], loaded: true, error: '' });
        } else {
          const data = await fetchCustomerDashboard();
          setStats({ vehicles: [], ...data, users: [], loaded: true, error: '' });
        }
      } catch {
        setStats(s => ({ ...s, loaded: true, error: 'Failed to load dashboard data.' }));
      }
    })();
  }, [role]);

  const { vehicles, reservations, users, loaded, error } = stats;

  // Vehicle counts
  const vAvailable = vehicles.filter(v => v.status === 'Available').length;
  const vRented = vehicles.filter(v => v.status === 'Rented').length;
  const vMaintenance = vehicles.filter(v => v.status === 'Maintenance').length;

  // Reservation counts
  const rPending = reservations.filter(r => r.status === 'Pending').length;
  const rApproved = reservations.filter(r => r.status === 'Approved').length;
  const rCompleted = reservations.filter(r => r.status === 'Completed').length;
  const rCancelled = reservations.filter(r => r.status === 'Cancelled').length;

  // User counts (Admin only)
  const uAdmins = users.filter(u => u.role === 'Admin').length;
  const uWorkers = users.filter(u => u.role === 'Worker').length;
  const uCustomers = users.filter(u => u.role === 'Customer').length;

  // Recent: last 5
  const recentReservations = [...reservations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          {greeting()}, {user?.fullName.split(' ')[0]} 👋
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Here's what's happening with RentivoMK today.
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Vehicle Stats — Admin & Worker */}
      {(role === 'Admin' || role === 'Worker') && (
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Fleet Overview</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {!loaded ? (
              [1, 2, 3].map(i => <SkeletonCard key={i} />)
            ) : (
              <>
                <StatCard
                  label="Available Vehicles"
                  value={vAvailable}
                  color="text-emerald-400"
                  bg="bg-emerald-500/10 border-emerald-500/20"
                  onClick={() => navigate('/vehicles?filter=available')}
                  icon={<svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatCard
                  label="Currently Rented"
                  value={vRented}
                  color="text-blue-400"
                  bg="bg-blue-500/10 border-blue-500/20"
                  onClick={() => navigate('/vehicles')}
                  icon={<svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-1.5-4.5a1 1 0 00-.95-.5H7.45a1 1 0 00-.95.5L5 9M3 12v6a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-6M3 12h18" /></svg>}
                />
                <StatCard
                  label="In Maintenance"
                  value={vMaintenance}
                  color="text-orange-400"
                  bg="bg-orange-500/10 border-orange-500/20"
                  onClick={() => navigate('/vehicles')}
                  icon={<svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>}
                />
              </>
            )}
          </div>
        </section>
      )}

      {/* Reservation Stats */}
      <section>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          {role === 'Customer' ? 'My Reservations' : 'Reservation Overview'}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {!loaded ? (
            [1, 2, 3, 4].map(i => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard
                label="Pending"
                value={rPending}
                color="text-yellow-400"
                bg="bg-yellow-500/10 border-yellow-500/20"
                onClick={() => navigate(role === 'Customer' ? '/reservations/my' : '/reservations')}
                icon={<svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <StatCard
                label="Approved"
                value={rApproved}
                color="text-emerald-400"
                bg="bg-emerald-500/10 border-emerald-500/20"
                onClick={() => navigate(role === 'Customer' ? '/reservations/my' : '/reservations')}
                icon={<svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <StatCard
                label="Completed"
                value={rCompleted}
                color="text-slate-300"
                bg="bg-slate-700/40 border-slate-700"
                onClick={() => navigate(role === 'Customer' ? '/reservations/my' : '/reservations')}
                icon={<svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              />
              <StatCard
                label="Cancelled"
                value={rCancelled}
                color="text-red-400"
                bg="bg-red-500/10 border-red-500/20"
                onClick={() => navigate(role === 'Customer' ? '/reservations/my' : '/reservations')}
                icon={<svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
              />
            </>
          )}
        </div>
      </section>

      {/* User Stats — Admin only */}
      {role === 'Admin' && (
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">User Overview</h3>
          <div className="grid grid-cols-3 gap-3">
            {!loaded ? (
              [1, 2, 3].map(i => <SkeletonCard key={i} />)
            ) : (
              <>
                <StatCard
                  label="Admins"
                  value={uAdmins}
                  color="text-purple-400"
                  bg="bg-purple-500/10 border-purple-500/20"
                  onClick={() => navigate('/users')}
                  icon={<svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                />
                <StatCard
                  label="Workers"
                  value={uWorkers}
                  color="text-blue-400"
                  bg="bg-blue-500/10 border-blue-500/20"
                  onClick={() => navigate('/users')}
                  icon={<svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                />
                <StatCard
                  label="Customers"
                  value={uCustomers}
                  color="text-amber-400"
                  bg="bg-amber-500/10 border-amber-500/20"
                  onClick={() => navigate('/users')}
                  icon={<svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                />
              </>
            )}
          </div>
        </section>
      )}

      {/* Bottom row: Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Reservations */}
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent Activity</h3>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {!loaded ? (
              <div className="divide-y divide-slate-800">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 px-5 py-4 animate-pulse">
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-slate-800 rounded w-2/3" />
                      <div className="h-3 bg-slate-800 rounded w-1/2" />
                    </div>
                    <div className="h-5 bg-slate-800 rounded-full w-16" />
                  </div>
                ))}
              </div>
            ) : recentReservations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-slate-500 text-sm">No recent activity</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {recentReservations.map(r => (
                  <div key={r.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-800/40 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{r.vehicleName}</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {role !== 'Customer' && <span>{r.customerName} · </span>}
                        {formatDate(r.startDate)} → {formatDate(r.endDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-amber-400 text-xs font-medium">€{r.totalPrice.toFixed(0)}</span>
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {role === 'Customer' && (
              <>
                <QuickAction
                  label="Browse Vehicles"
                  description="Find and reserve your next car"
                  accent="bg-amber-500/15 border border-amber-500/20"
                  onClick={() => navigate('/vehicles')}
                  icon={<svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-1.5-4.5a1 1 0 00-.95-.5H7.45a1 1 0 00-.95.5L5 9M3 12v6a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-6M3 12h18" /></svg>}
                />
                <QuickAction
                  label="My Reservations"
                  description="Track the status of your bookings"
                  accent="bg-emerald-500/15 border border-emerald-500/20"
                  onClick={() => navigate('/reservations/my')}
                  icon={<svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                />
              </>
            )}
            {(role === 'Admin' || role === 'Worker') && (
              <>
                <QuickAction
                  label="Manage Reservations"
                  description="Approve, reject, or complete bookings"
                  accent="bg-amber-500/15 border border-amber-500/20"
                  onClick={() => navigate('/reservations')}
                  icon={<svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
                />
                <QuickAction
                  label="View Fleet"
                  description="Browse and manage all vehicles"
                  accent="bg-blue-500/15 border border-blue-500/20"
                  onClick={() => navigate('/vehicles')}
                  icon={<svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-1.5-4.5a1 1 0 00-.95-.5H7.45a1 1 0 00-.95.5L5 9M3 12v6a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1v-6M3 12h18" /></svg>}
                />
              </>
            )}
            {role === 'Admin' && (
              <>
                <QuickAction
                  label="Add New Vehicle"
                  description="Expand the fleet with a new car"
                  accent="bg-emerald-500/15 border border-emerald-500/20"
                  onClick={() => navigate('/vehicles')}
                  icon={<svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>}
                />
                <QuickAction
                  label="Manage Users"
                  description="Edit roles and user accounts"
                  accent="bg-purple-500/15 border border-purple-500/20"
                  onClick={() => navigate('/users')}
                  icon={<svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                />
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}