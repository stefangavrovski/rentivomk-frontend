import type { VehicleStatus, ReservationStatus } from '../../types';

type Status = VehicleStatus | ReservationStatus;

const config: Record<Status, { label: string; classes: string }> = {
  Available:   { label: 'Available',   classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  Rented:      { label: 'Rented',      classes: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  Maintenance: { label: 'Maintenance', classes: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
  Pending:     { label: 'Pending',     classes: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  Approved:    { label: 'Approved',    classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  Rejected:    { label: 'Rejected',    classes: 'bg-red-500/15 text-red-400 border-red-500/30' },
  Completed:   { label: 'Completed',   classes: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  Cancelled:   { label: 'Cancelled',   classes: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

export default function StatusBadge({ status }: { status: Status }) {
  const { label, classes } = config[status] ?? { label: status, classes: 'bg-slate-500/15 text-slate-400 border-slate-500/30' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes}`}>
      {label}
    </span>
  );
}