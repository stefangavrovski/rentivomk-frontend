import { useState, useEffect } from 'react';
import type { VehicleDto, CreateVehicleDto, UpdateVehicleDto, VehicleStatus } from '../../types';

interface Props {
  vehicle?: VehicleDto;
  onSubmit: (data: CreateVehicleDto | UpdateVehicleDto) => Promise<void>;
  onClose: () => void;
}

const emptyForm: CreateVehicleDto = {
  make: '',
  model: '',
  year: new Date().getFullYear(),
  pricePerDay: 0,
  category: '',
  description: '',
};

export default function VehicleFormModal({ vehicle, onSubmit, onClose }: Props) {
  const isEdit = !!vehicle;
  const [form, setForm] = useState<CreateVehicleDto & { status?: VehicleStatus }>(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setForm({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        pricePerDay: vehicle.pricePerDay,
        category: vehicle.category,
        description: vehicle.description,
        status: vehicle.status,
      });
    }
  }, [vehicle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'pricePerDay' ? Number(value) : value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSubmit(form);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition text-sm';
  const labelClass = 'block text-sm font-medium text-slate-300 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">
            {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Make</label>
              <input name="make" value={form.make} onChange={handleChange} required placeholder="Toyota" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Model</label>
              <input name="model" value={form.model} onChange={handleChange} required placeholder="Corolla" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Year</label>
              <input type="number" name="year" value={form.year} onChange={handleChange} required min={1990} max={2030} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Price / Day (€)</label>
              <input type="number" name="pricePerDay" value={form.pricePerDay} onChange={handleChange} required min={0} step={0.01} className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Category</label>
            <select name="category" value={form.category} onChange={handleChange} required className={inputClass}>
              <option value="">Select category</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Van">Van</option>
              <option value="Coupe">Coupe</option>
              <option value="Convertible">Convertible</option>
              <option value="Truck">Truck</option>
            </select>
          </div>

          {isEdit && (
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                <option value="Available">Available</option>
                <option value="Rented">Rented</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          )}

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief description of the vehicle..."
              className={inputClass + ' resize-none'}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-950 font-semibold text-sm transition-colors">
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}