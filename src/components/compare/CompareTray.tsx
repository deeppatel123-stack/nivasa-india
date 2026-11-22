import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Scale, X } from 'lucide-react';
import { useListings } from '@/features/listings/queries';
import { formatINR } from '@/features/pricing/pricing';
import { useCompareStore } from '@/store/useCompareStore';

export function CompareTray() {
  const { pathname } = useLocation();
  const { ids, remove, clear } = useCompareStore();
  const { data: listings } = useListings();
  if (pathname === '/compare' || ids.length === 0) return null;

  const selected = ids
    .map((id) => listings?.find((listing) => listing.id === id))
    .filter((listing) => Boolean(listing));

  return (
    <div className="fixed inset-x-0 bottom-0 z-[900] border-t border-ink-800 bg-ink-950/95 text-white backdrop-blur">
      <div className="shell flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10">
            <Scale className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold">{ids.length} of 4 selected for comparison</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {selected.map((property) => (
                <span key={property!.id} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                  <span className="max-w-[110px] truncate">{property!.title}</span>
                  <button type="button" onClick={() => remove(property!.id)} aria-label={`Remove ${property!.title}`} className="text-white/60 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={clear} className="rounded-lg px-2 py-1 text-xs text-white/60 hover:text-white">
            Clear all
          </button>
          <Link
            to="/compare"
            className="inline-flex items-center gap-2 rounded-xl bg-saffron-500 px-4 py-2 text-xs font-bold text-ink-950 transition hover:bg-saffron-400"
          >
            Compare now <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
      <p className="sr-only">{selected.map((p) => formatINR(p!.prices.rent)).join(', ')}</p>
    </div>
  );
}
