import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-950 text-white text-2xl">
      {label} — coming soon
    </div>
  );
}

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Placeholder label="Dashboard" />} />
        <Route path="/vehicles" element={<Placeholder label="Vehicles" />} />
        <Route path="/vehicles/:id" element={<Placeholder label="Vehicle Detail" />} />
        <Route path="/reservations" element={<Placeholder label="Reservations" />} />
        <Route path="/users" element={<Placeholder label="Users" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}