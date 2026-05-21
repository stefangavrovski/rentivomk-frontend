import { useAuth } from '../../hooks/useAuth';

interface Props {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: Props) {
  const { user } = useAuth();

  const roleBadgeColor: Record<string, string> = {
    Admin: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    Worker: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    Customer: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  };

  const badgeClass = user ? roleBadgeColor[user.role] ?? '' : '';

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h1 className="text-white font-semibold text-base leading-tight">{title}</h1>
        {subtitle && <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>}
      </div>
      {user && (
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${badgeClass}`}>
          {user.role}
        </span>
      )}
    </header>
  );
}
