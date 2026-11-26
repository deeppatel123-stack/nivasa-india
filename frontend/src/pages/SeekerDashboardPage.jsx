import { Link } from 'react-router-dom';
import { BookmarkCheck, Clock3, Compass, Heart, Map, Scale, Search } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { buttonClasses } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useCompareStore } from '@/store/useCompareStore';
import { useRecentlyViewedStore } from '@/store/useRecentlyViewedStore';
import { useSavedStore } from '@/store/useSavedStore';

const ACTIONS = [
  { to: '/search', icon: Search, title: 'Search locations', description: 'Find PGs, hostels, rooms, and rentals near any place in India.' },
  { to: '/map', icon: Map, title: 'Explore on map', description: 'See nearby options with distance and area context.' },
  { to: '/compare', icon: Scale, title: 'Compare places', description: 'Review shortlisted places side by side before deciding.' },
  { to: '/assistant', icon: Compass, title: 'Get recommendations', description: 'Ask for suggestions based on your current search results.' },
];

export function SeekerDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const saved = useSavedStore((state) => state.ids.length);
  const compared = useCompareStore((state) => state.ids.length);
  const recent = useRecentlyViewedStore((state) => state.ids.length);
  const roleLabel = user?.role === 'professional' ? 'Working professional' : 'Student';

  return (
    <PageShell
      eyebrow={`${roleLabel} dashboard`}
      title={`Welcome${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
      description="Your accommodation search, saved places, comparisons, and recent activity in one place."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">Saved places</p><p className="mt-2 flex items-center gap-2 font-display text-3xl font-bold text-ink-950"><Heart className="h-5 w-5 text-saffron-500" />{saved}</p></div>
        <div className="card p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">In comparison</p><p className="mt-2 flex items-center gap-2 font-display text-3xl font-bold text-ink-950"><Scale className="h-5 w-5 text-teal-600" />{compared}</p></div>
        <div className="card p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">Recently viewed</p><p className="mt-2 flex items-center gap-2 font-display text-3xl font-bold text-ink-950"><Clock3 className="h-5 w-5 text-ink-600" />{recent}</p></div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {ACTIONS.map(({ to, icon: Icon, title, description }) => (
          <Link key={to} to={to} className="card group p-5 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lift">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><Icon className="h-5 w-5" /></span>
            <h2 className="mt-4 font-display text-lg font-bold text-ink-950 group-hover:text-teal-700">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-500">{description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-teal-200 bg-teal-50/60 p-5">
        <div className="flex items-start gap-3">
          <BookmarkCheck className="mt-0.5 h-5 w-5 text-teal-700" />
          <div>
            <h2 className="font-display text-base font-bold text-teal-950">Tip for better results</h2>
            <p className="mt-1 text-sm text-teal-900/80">Search by a specific landmark, college, office, or locality and adjust the radius if you see too few options.</p>
            <Link to="/search" className={buttonClasses('primary', 'sm', 'mt-4')}>Start searching</Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
