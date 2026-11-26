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
      title="Saved places"
      description="Places you saved to revisit later."
      eyebrow="Your shortlist"
      actions={properties.length > 0 ? (
        <Button variant="outline" size="sm" leftIcon={<Trash2 className="h-3.5 w-3.5" aria-hidden />} onClick={clearSaved}>
          Clear all
        </Button>
      ) : undefined}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="teal">{properties.length} saved {properties.length === 1 ? 'place' : 'places'}</Badge>
        </div>
        <p className="text-xs text-ink-500">In the order you saved them</p>
      </div>

      {properties.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved places yet"
          description="Use the heart on any place to save it here for later."
          action={<Link to="/explore" className={buttonClasses('primary', 'md')}>Find places</Link>}
          secondary={<Link to="/map" className={buttonClasses('outline', 'md')}><MapPinned className="h-4 w-4" aria-hidden />Explore on the map</Link>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => <PropertyCard key={property.id} property={property} layout="grid" />)}
        </div>
      )}
    </PageShell>
  );
}
