import { Link } from 'react-router-dom';
import { History, MapPinned, Trash2 } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useRecentlyViewedStore } from '@/store/useRecentlyViewedStore';
import { useToastStore } from '@/store/useToastStore';

export function RecentlyViewedPage() {
  const ids = useRecentlyViewedStore((state) => state.ids);
  const items = useRecentlyViewedStore((state) => state.items);
  const clearRecentlyViewed = useRecentlyViewedStore((state) => state.clear);
  const pushToast = useToastStore((state) => state.push);
  const properties = ids.map((id) => items[id]).filter(Boolean);

  const handleClear = () => {
    clearRecentlyViewed();
    pushToast('Recently viewed trail cleared from this browser.', 'info');
  };

  return (
    <PageShell
      title="Recently viewed"
      description="Genuine records you opened, shown in the order you visited them."
      eyebrow="Your activity"
      actions={properties.length > 0 ? (
        <Button variant="outline" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" aria-hidden />} onClick={handleClear}>Clear all</Button>
      ) : undefined}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="teal">{properties.length} viewed</Badge>
          <Badge tone="amber">Stored locally</Badge>
        </div>
        <p className="text-xs text-ink-500">Newest first · up to 12 genuine records</p>
      </div>

      {properties.length === 0 ? (
        <EmptyState
          icon={History}
          title="No recently viewed records"
          description="Open any genuine record to start a trail here. The list updates newest first and stays in this browser."
          action={<Link to="/explore" className={buttonClasses('primary', 'md')}>Find stays near a location</Link>}
          secondary={<Link to="/map" className={buttonClasses('outline', 'md')}><MapPinned className="h-4 w-4" aria-hidden />Explore on the map</Link>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((property, index) => (
            <div key={property.id} className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
                <Badge tone="neutral">#{index + 1} · {index === 0 ? 'Most recent' : 'Earlier'}</Badge>
                <span className="text-[11px] text-ink-400">Genuine record</span>
              </div>
              <PropertyCard property={property} layout="grid" />
            </div>
          ))}
        </div>
      )}

      <p className="mt-7 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-900" role="note">
        This trail is stored in your browser, not in an account or on a server. Source data may
        become stale; check the original source before acting on it.
      </p>
    </PageShell>
  );
}
