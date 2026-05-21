import { useState } from 'react';
import type { VehicleDto } from '../../types';
import { reservationApi } from '../../api/reservations';
import { useToast } from '../../context/ToastContext';

interface Props {
  vehicle: VehicleDto;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateReservationModal({ vehicle, onClose, onSuccess }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const { showToast } = useToast();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const days =
    startDate && endDate
      ? Math.max(0, Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
      : 0;

  const totalPrice = days * vehicle.pricePerDay;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!startDate || !endDate) { setError('Please select both start and end dates.'); return; }
    if (new Date(startDate) >= new Date(endDate)) { setError('Start date must be before end date.'); return; }

    setLoading(true);
    try {
      await reservationApi.create({
        vehicleId: vehicle.id,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      showToast('Reservation submitted! You can track it under My Reservations.');
      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error ?? 'Failed to create reservation.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-sm';
  const labelClass = 'block text-sm font-medium text-slate-300 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-semibold text-lg">Reserve Vehicle</h3>
            <p className="text-slate-400 text-sm mt-0.5">{vehicle.make} {vehicle.model} · €{vehicle.pricePerDay}/day</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Start Date</label>
            <input type="date" value={startDate} min={today} onChange={e => { setStartDate(e.target.value); setError(''); }} required className={inputClass + ' [color-scheme:dark]'} />
          </div>
          <div>
            <label className={labelClass}>End Date</label>
            <input type="date" value={endDate} min={startDate || today} onChange={e => { setEndDate(e.target.value); setError(''); }} required className={inputClass + ' [color-scheme:dark]'} />
          </div>

          {days > 0 && (
            <div className="rounded-xl bg-slate-800/60 border border-slate-700 px-4 py-3 flex items-center justify-between">
              <div className="text-slate-400 text-sm">{days} day{days !== 1 ? 's' : ''} × €{vehicle.pricePerDay}</div>
              <div>
                <span className="text-amber-400 font-bold text-lg">€{totalPrice.toFixed(2)}</span>
                <span className="text-slate-500 text-xs ml-1">total</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={loading || days === 0}
              className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/40 disabled:cursor-not-allowed text-slate-950 font-semibold text-sm transition-colors shadow-lg shadow-amber-500/20">
              {loading ? 'Reserving...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}