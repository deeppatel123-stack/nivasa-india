import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { BadgeCheck, CircleHelp, FlaskConical } from 'lucide-react';
import { VERIFICATION_LABELS, type VerificationState } from '@/features/listings/types';

const CONFIG: Record<VerificationState, { tone: BadgeTone; icon: typeof BadgeCheck }> = {
  verified: { tone: 'green', icon: BadgeCheck },
  unverified: { tone: 'neutral', icon: CircleHelp },
  demo: { tone: 'amber', icon: FlaskConical },
};

export function VerificationBadge({ state }: { state: VerificationState }) {
  const { tone, icon: Icon } = CONFIG[state];
  return (
    <Badge tone={tone} icon={<Icon className="h-3 w-3" aria-hidden />}>
      {VERIFICATION_LABELS[state]}
    </Badge>
  );
}
