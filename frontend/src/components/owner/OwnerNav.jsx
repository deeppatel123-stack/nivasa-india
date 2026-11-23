import { ClipboardList, LayoutDashboard, LockKeyhole, PlusCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
const OWNER_LINKS = [
    { to: '/owner/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/owner/add-property', label: 'Add property', icon: PlusCircle },
    { to: '/owner/listings', label: 'Manage listings', icon: ClipboardList },
];
/** Section-level navigation shared by every owner page. */
export function OwnerNav({ className }) {
    return (<nav aria-label="Owner tools navigation" className={cn('card no-scrollbar flex items-center gap-2 overflow-x-auto p-2', className)}>
      {OWNER_LINKS.map(({ to, label, icon: Icon, end }) => (<NavLink key={to} to={to} end={end} className={({ isActive }) => cn('inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition sm:text-sm', isActive
                ? 'bg-ink-900 text-white shadow-soft'
                : 'text-ink-600 hover:bg-ink-50 hover:text-ink-950')}>
          <Icon className="h-4 w-4" aria-hidden/>
          {label}
        </NavLink>))}
      <span className="ml-auto hidden shrink-0 items-center gap-1.5 pr-2 text-[11px] font-medium text-ink-400 lg:inline-flex">
        <LockKeyhole className="h-3.5 w-3.5" aria-hidden/>
        Owner workspace
      </span>
    </nav>);
}
