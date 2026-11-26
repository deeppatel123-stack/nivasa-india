import { Link } from 'react-router-dom';
import { Database, ShieldCheck, Users, Wrench } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { buttonClasses } from '@/components/ui/Button';

export function AdminDashboardPage() {
  return (
    <PageShell
      eyebrow="Administrator"
      title="Admin dashboard"
      description="Administrative tools are protected. Full moderation and management workflows can be expanded as data sources and verification processes are connected."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <ShieldCheck className="h-5 w-5 text-teal-700" />
          <h2 className="mt-3 font-display text-lg font-bold text-ink-950">Listing moderation</h2>
          <p className="mt-1 text-sm text-ink-500">Owner submissions are stored as pending. Add review/approval workflows before publishing them publicly.</p>
        </div>
        <div className="card p-5">
          <Users className="h-5 w-5 text-teal-700" />
          <h2 className="mt-3 font-display text-lg font-bold text-ink-950">User management</h2>
          <p className="mt-1 text-sm text-ink-500">Role-based access is in place. User administration, audit logs, and account controls can be added here.</p>
        </div>
        <div className="card p-5">
          <Database className="h-5 w-5 text-teal-700" />
          <h2 className="mt-3 font-display text-lg font-bold text-ink-950">Data quality</h2>
          <p className="mt-1 text-sm text-ink-500">Monitor source attribution, demo/verified labels, and missing fields. Never present incomplete data as verified.</p>
        </div>
        <div className="card p-5">
          <Wrench className="h-5 w-5 text-teal-700" />
          <h2 className="mt-3 font-display text-lg font-bold text-ink-950">Integrations</h2>
          <p className="mt-1 text-sm text-ink-500">Configure authorized data providers, email delivery, and production secrets before enabling related features.</p>
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <Link to="/owner/listings" className={buttonClasses('outline', 'md')}>View submissions</Link>
        <Link to="/search" className={buttonClasses('primary', 'md')}>Open search</Link>
      </div>
    </PageShell>
  );
}
