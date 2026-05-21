import { useEffect, useState } from 'react';
import { userApi } from '../api/users';
import { useAuth } from '../hooks/useAuth';
import type { UserDto, UpdateUserDto, UserRole } from '../types';
import PageHeader from '../components/layout/PageHeader';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import UserFormModal from '../components/users/UserFormModal';

const roleBadge: Record<UserRole, string> = {
  Admin:    'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Worker:   'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Customer: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
};

type FilterRole = 'All' | UserRole;
const ROLE_FILTERS: FilterRole[] = ['All', 'Admin', 'Worker', 'Customer'];

export default function UsersPage() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<UserDto[]>([]);
  const [filter, setFilter] = useState<FilterRole>('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editTarget, setEditTarget] = useState<UserDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await userApi.getAll();
      setUsers(res.data.sort((a, b) => a.id - b.id));
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdate = async (dto: UpdateUserDto) => {
    if (!editTarget) return;
    await userApi.update(editTarget.id, dto);
    await fetchUsers();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await userApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      await fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to delete user.');
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = users.filter(u => {
    const matchesRole = filter === 'All' || u.role === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const counts: Record<string, number> = {
    Admin:    users.filter(u => u.role === 'Admin').length,
    Worker:   users.filter(u => u.role === 'Worker').length,
    Customer: users.filter(u => u.role === 'Customer').length,
  };

  const summaryCards = [
    { label: 'Admins',    value: counts.Admin,    color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { label: 'Workers',   value: counts.Worker,   color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Customers', value: counts.Customer, color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
  ];

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const getInitials = (u: UserDto) =>
    `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase();

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage all registered users and their roles"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {summaryCards.map(card => (
          <button
            key={card.label}
            onClick={() => setFilter(filter === card.label.slice(0, -1) as FilterRole ? 'All' : card.label.slice(0, -1) as FilterRole)}
            className={`rounded-xl border px-4 py-3 text-left transition-all hover:scale-[1.02] ${card.bg}`}
          >
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-slate-400 text-xs mt-0.5">{card.label}</p>
          </button>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
          {ROLE_FILTERS.map(r => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === r
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm transition"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex items-center gap-4 px-5 py-4 animate-pulse ${i !== 0 ? 'border-t border-slate-800' : ''}`}>
              <div className="w-9 h-9 rounded-lg bg-slate-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-slate-800 rounded w-1/4" />
                <div className="h-3 bg-slate-800 rounded w-1/3" />
              </div>
              <div className="h-5 bg-slate-800 rounded-full w-16" />
              <div className="h-3 bg-slate-800 rounded w-20 hidden sm:block" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">No users found</p>
          <p className="text-slate-600 text-sm mt-1">
            {filter !== 'All' || search ? 'Try adjusting your filters.' : 'No users are registered yet.'}
          </p>
        </div>
      )}

      {/* Users table */}
      {!loading && filtered.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {filtered.map((u, i) => {
            return (
              <div
                key={u.id}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-800/40 transition-colors ${
                  i !== 0 ? 'border-t border-slate-800' : ''
                }`}
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <span className="text-slate-300 text-xs font-bold">{getInitials(u)}</span>
                </div>

                {/* Name + email */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium truncate">
                      {u.firstName} {u.lastName}
                    </p>
                    {u.email === currentUser?.email && (
                      <span className="text-xs text-slate-500 border border-slate-700 rounded-full px-2 py-0.5 shrink-0">you</span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs truncate">{u.email}</p>
                </div>

                {/* Role badge */}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 ${roleBadge[u.role]}`}>
                  {u.role}
                </span>

                {/* Joined date */}
                <p className="text-slate-600 text-xs shrink-0 hidden sm:block">
                  Joined {formatDate(u.createdAt)}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setEditTarget(u)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border border-slate-700 hover:border-amber-500/30 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(u)}
                    disabled={u.email === currentUser?.email}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editTarget && (
        <UserFormModal
          user={editTarget}
          onSubmit={handleUpdate}
          onClose={() => setEditTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete User"
          message={`Are you sure you want to delete ${deleteTarget.firstName} ${deleteTarget.lastName}? All their reservations will also be deleted. This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}