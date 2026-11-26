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
    pushToast('Recently viewed list cleared.', 'info');
  };

  return (
    <PageShell
      title="Recently viewed"
      description="Places you opened recently, shown in the order you visited them."
      eyebrow="Your activity"
      actions={properties.length > 0 ? (
        <Button variant="outline" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" aria-hidden />} onClick={handleClear}>Clear all</Button>
      ) : undefined}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="teal">{properties.length} viewed</Badge>
        </div>
        <p className="text-xs text-ink-500">Newest first · up to 12 places</p>
      </div>

      {properties.length === 0 ? (
        <EmptyState
          icon={History}
          title="No recently viewed places"
          description="Open a place to see it here. Your recent list updates as you browse."
          action={<Link to="/explore" className={buttonClasses('primary', 'md')}>Find places</Link>}
          secondary={<Link to="/map" className={buttonClasses('outline', 'md')}><MapPinned className="h-4 w-4" aria-hidden />Explore on the map</Link>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((property, index) => (
            <div key={property.id} className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-2 px-0.5">
                <Badge tone="neutral">#{index + 1} · {index === 0 ? 'Most recent' : 'Earlier'}</Badge>
              </div>
              <PropertyCard property={property} layout="grid" />
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
