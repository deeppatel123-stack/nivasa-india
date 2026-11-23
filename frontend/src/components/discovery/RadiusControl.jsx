import { useSearchParams } from 'react-router-dom';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import { useSearchStore } from '@/store/useSearchStore';
const MIN_RADIUS_KM = 0.5;
const MAX_RADIUS_KM = 50;
const RADIUS_OPTIONS = [MIN_RADIUS_KM, 1, 2, 5, 10, 20, MAX_RADIUS_KM].map((value) => ({
    value: String(value),
    label: `Within ${value} km`,
}));
const clampRadius = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed))
        return 5;
    return Math.min(MAX_RADIUS_KM, Math.max(MIN_RADIUS_KM, parsed));
};
/** Single radius selector that keeps the shareable URL in step with the search store. */
export function RadiusControl({ label = 'Search radius in kilometres', className, }) {
    const radiusKm = useSearchStore((state) => state.radiusKm);
    const setRadius = useSearchStore((state) => state.setRadius);
    const [, setSearchParams] = useSearchParams();
    const changeRadius = (value) => {
        const radius = clampRadius(value);
        setRadius(radius);
        setSearchParams((previous) => {
            const next = new URLSearchParams(previous);
            next.set('radius', String(radius));
            return next;
        }, { replace: true });
    };
    return (<div className={cn('w-full sm:w-40', className)}>
      <Select aria-label={label} value={String(radiusKm)} options={RADIUS_OPTIONS} onChange={(event) => changeRadius(Number(event.target.value))} className="h-10 py-0 text-xs"/>
    </div>);
}
