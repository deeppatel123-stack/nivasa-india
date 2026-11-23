import { Badge } from '@/components/ui/Badge';
import { BadgeCheck, CircleHelp } from 'lucide-react';
const CONFIG = {
    verified: { tone: 'green', icon: BadgeCheck, label: 'Verified listing' },
    unverified: { tone: 'neutral', icon: CircleHelp, label: 'Unverified listing' },
};
const FALLBACK = { tone: 'neutral', icon: CircleHelp, label: 'Verification not available' };
export function VerificationBadge({ state }) {
    const { tone, icon: Icon, label } = CONFIG[state] ?? FALLBACK;
    return (<Badge tone={tone} icon={<Icon className="h-3 w-3" aria-hidden/>}>
      {label}
    </Badge>);
}
