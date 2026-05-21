import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-950 text-white text-2xl">
      {label} — coming soon
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Placeholder label="Login" />} />
      <Route path="/register" element={<Placeholder label="Register" />} />
      <Route path="/unauthorized" element={<Placeholder label="Unauthorized" />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Placeholder label="Dashboard" />} />
        <Route path="/vehicles" element={<Placeholder label="Vehicles" />} />
        <Route path="/reservations" element={<Placeholder label="Reservations" />} />
        <Route path="/users" element={<Placeholder label="Users" />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}