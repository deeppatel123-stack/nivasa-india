import { Badge } from '@/components/ui/Badge';
import { BadgeCheck, CircleHelp, FlaskConical } from 'lucide-react';
import { VERIFICATION_LABELS } from '@/features/listings/types';
const CONFIG = {
    verified: { tone: 'green', icon: BadgeCheck },
    unverified: { tone: 'neutral', icon: CircleHelp },
    demo: { tone: 'amber', icon: FlaskConical },
};
export function VerificationBadge({ state }) {
    const { tone, icon: Icon } = CONFIG[state];
    return (<Badge tone={tone} icon={<Icon className="h-3 w-3" aria-hidden/>}>
      {VERIFICATION_LABELS[state]}
    </Badge>);
}
