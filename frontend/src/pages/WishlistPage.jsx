import { Link } from 'react-router-dom';
import { Heart, MapPinned, Trash2 } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { Button, buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useSavedStore } from '@/store/useSavedStore';

export function WishlistPage() {
  const ids = useSavedStore((state) => state.ids);
  const items = useSavedStore((state) => state.items);
  const clearSaved = useSavedStore((state) => state.clear);
  const properties = ids.map((id) => items[id]).filter(Boolean);

  return (
    <PageShell
      title="Saved stays"
      description="A shortlist of genuine records you marked with a heart, kept in this browser."
      eyebrow="Your shortlist"
      actions={properties.length > 0 ? (
        <Button variant="outline" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" aria-hidden />} onClick={clearSaved}>
          Clear all
        </Button>
      ) : undefined}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="teal">{properties.length} saved {properties.length === 1 ? 'record' : 'records'}</Badge>
          <Badge tone="amber">Saved locally</Badge>
        </div>
        <p className="text-xs text-ink-500">In the order you saved them · source data only</p>
      </div>

      {properties.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          description="Use the heart on any genuine record to add it here. Your shortlist is kept in this browser, not in an account."
          action={<Link to="/explore" className={buttonClasses('primary', 'md')}>Find stays near a location</Link>}
          secondary={<Link to="/map" className={buttonClasses('outline', 'md')}><MapPinned className="h-4 w-4" aria-hidden />Explore on the map</Link>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => <PropertyCard key={property.id} property={property} layout="grid" />)}
        </div>
      )}

      <p className="mt-7 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs leading-relaxed text-amber-900" role="note">
        This shortlist is stored in your browser. It is not synced to an account, and source
        data may become stale. Check the source link on each record before making decisions.
      </p>
    </PageShell>
  );
}
