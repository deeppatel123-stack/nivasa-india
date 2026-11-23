import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, FileText, LockKeyhole, PlusCircle, RefreshCw, Send, ShieldCheck } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { OwnerNav } from '@/components/owner/OwnerNav';
import { OwnerPreviewNotice } from '@/components/owner/OwnerPreviewNotice';
import { Badge } from '@/components/ui/Badge';
import { Button, LinkButton } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, formatINR } from '@/features/pricing/pricing';
import { cn } from '@/lib/utils';
import { apiFetch } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending moderation' },
    { key: 'published', label: 'Published' },
    { key: 'unpublished', label: 'Not published' },
];
function matchesTab(tab, item) {
    if (tab === 'all')
        return true;
    if (tab === 'pending')
        return String(item.status ?? '').toLowerCase() === 'pending';
    if (tab === 'published')
        return item.published === true;
    return item.published === false;
}
function statusTone(status) {
    const value = String(status ?? '').toLowerCase();
    if (value === 'pending')
        return 'amber';
    if (value === 'approved' || value === 'published')
        return 'green';
    if (value === 'rejected')
        return 'red';
    return 'neutral';
}
function RecordCard({ item }) {
    const source = item.source?.name ?? item.provider ?? 'Not available';
    const storage = item.storage ?? item.persistence ?? 'Not available';
    return (<li className="rounded-xl border border-ink-100 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="break-words text-sm font-bold text-ink-900">{item.title || 'Not available'}</p>
          <p className="mt-0.5 break-all font-mono text-[10px] text-ink-400">{item.id ?? item.externalId ?? 'No id supplied'}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone={statusTone(item.status)}>{item.status ?? 'Not available'}</Badge>
          <Badge tone={item.published === true ? 'green' : 'neutral'}>
            {item.published === true ? 'Published' : item.published === false ? 'Not published' : 'Not available'}
          </Badge>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
        <div>
          <dt className="text-ink-400">Rent</dt>
          <dd className="mt-0.5 font-semibold text-ink-800">{formatINR(item.prices?.rent)}</dd>
        </div>
        <div>
          <dt className="text-ink-400">Submitted</dt>
          <dd className="mt-0.5 font-semibold text-ink-800">{formatDate(item.submittedAt ?? item.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-ink-400">Source</dt>
          <dd className="mt-0.5 break-words font-semibold text-ink-800">{source}</dd>
        </div>
        <div>
          <dt className="text-ink-400">Storage</dt>
          <dd className="mt-0.5 break-words font-semibold text-ink-800">{storage}</dd>
        </div>
      </dl>
    </li>);
}
export function ManageListingsPage() {
    const user = useAuthStore((state) => state.user);
    const [activeTab, setActiveTab] = useState('all');
    const tabRefs = useRef([]);
    const { data, isPending, isError, error, refetch, isFetching } = useQuery({
        queryKey: ['submissions', 'owner'],
        queryFn: ({ signal }) => apiFetch('/submissions', { signal }),
        enabled: Boolean(user),
        retry: false,
    });
    const submissions = data?.items ?? [];
    const visibleListings = submissions.filter((item) => matchesTab(activeTab, item));
    function countFor(tab) {
        return tab === 'all' ? submissions.length : submissions.filter((item) => matchesTab(tab, item)).length;
    }
    function handleTabKeyDown(event, index) {
        let nextIndex = index;
        if (event.key === 'ArrowRight')
            nextIndex = (index + 1) % TABS.length;
        else if (event.key === 'ArrowLeft')
            nextIndex = (index - 1 + TABS.length) % TABS.length;
        else if (event.key === 'Home')
            nextIndex = 0;
        else if (event.key === 'End')
            nextIndex = TABS.length - 1;
        else
            return;
        event.preventDefault();
        setActiveTab(TABS[nextIndex].key);
        tabRefs.current[nextIndex]?.focus();
    }
    if (!user) {
        return (<PageShell eyebrow="Owner tools" title="Manage listings" description="Review the records you have submitted and their moderation status." breadcrumbs={[{ label: 'Owner tools', to: '/owner/dashboard' }, { label: 'Manage listings' }]}>
          <div className="space-y-6">
            <OwnerNav />
            <OwnerPreviewNotice />
            <div className="mx-auto max-w-2xl">
              <EmptyState icon={LockKeyhole} title="Log in to see your submissions" description="The submission list belongs to the signed-in owner account." action={<LinkButton to="/login" state={{ from: '/owner/listings' }} leftIcon={<LockKeyhole className="h-4 w-4"/>}>
                    Log in
                  </LinkButton>} secondary={<LinkButton to="/owner/dashboard" variant="outline">
                    Owner workspace
                  </LinkButton>}/>
            </div>
          </div>
        </PageShell>);
    }
    return (<PageShell eyebrow="Owner tools" title="Manage listings" description="Submitted owner records, their moderation status and where they are stored." breadcrumbs={[
            { label: 'Owner tools', to: '/owner/dashboard' },
            { label: 'Manage listings' },
        ]} actions={<LinkButton to="/owner/add-property" size="sm" leftIcon={<PlusCircle className="h-4 w-4"/>}>
          Add property
        </LinkButton>}>
      <div className="space-y-6">
        <OwnerNav />
        <OwnerPreviewNotice />

        <section className="card overflow-hidden" aria-labelledby="listing-workspace-heading">
          <div className="flex flex-col gap-3 border-b border-ink-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="field-label">Workspace</p>
              <h2 id="listing-workspace-heading" className="font-display text-lg font-extrabold text-ink-950">
                Your submissions <span className="text-ink-400">({submissions.length})</span>
              </h2>
            </div>
            <Button type="button" variant="outline" size="sm" loading={isFetching} onClick={() => refetch()} leftIcon={<RefreshCw className="h-3.5 w-3.5"/>}>
              Refresh
            </Button>
          </div>

          <div role="tablist" aria-label="Filter by submission status" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-ink-100 px-3 pt-3">
            {TABS.map((tab, index) => {
            const selected = tab.key === activeTab;
            return (<button key={tab.key} ref={(element) => {
                    tabRefs.current[index] = element;
                }} type="button" role="tab" id={`owner-tab-${tab.key}`} aria-controls="owner-listings-panel" aria-selected={selected} tabIndex={selected ? 0 : -1} onClick={() => setActiveTab(tab.key)} onKeyDown={(event) => handleTabKeyDown(event, index)} className={cn('inline-flex shrink-0 items-center gap-2 rounded-t-xl px-3 py-2.5 text-xs font-semibold transition sm:text-sm', selected
                    ? 'border-b-2 border-teal-600 bg-teal-50/60 text-teal-800'
                    : 'border-b-2 border-transparent text-ink-500 hover:bg-ink-50 hover:text-ink-800')}>
                  {tab.label}
                  <Badge tone={selected ? 'teal' : 'neutral'}>{countFor(tab.key)}</Badge>
                </button>);
        })}
          </div>

          <div id="owner-listings-panel" role="tabpanel" aria-labelledby={`owner-tab-${activeTab}`} tabIndex={0}>
            {isPending ? (<div className="space-y-3 p-5" role="status" aria-label="Loading your submissions">
              {[0, 1, 2].map((row) => (<div key={row} className="rounded-xl border border-ink-100 p-4">
                <Skeleton className="h-4 w-1/3"/>
                <Skeleton className="mt-3 h-3 w-2/3"/>
              </div>))}
              <span className="sr-only">Loading your submissions…</span>
            </div>) : isError ? (<div className="p-5 sm:p-8">
              <EmptyState icon={ShieldCheck} title="Submissions could not be loaded" description={error?.message || 'The API did not return your submissions. Try again.'} action={<Button type="button" variant="secondary" onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4"/>}>
                    Retry
                  </Button>} secondary={<LinkButton to="/owner/dashboard" variant="outline">
                    Back to overview
                  </LinkButton>}/>
            </div>) : visibleListings.length === 0 ? (<div className="p-5 sm:p-8">
              <EmptyState icon={activeTab === 'all' ? FileText : ClipboardList} title={submissions.length === 0 ? 'No submissions yet' : 'No records in this view'} description={submissions.length === 0
                    ? 'Records you submit will appear here with their status, publication flag, source and storage mode.'
                    : 'None of your submitted records match this status filter.'} action={<LinkButton to="/owner/add-property" variant="secondary" size="sm" leftIcon={<PlusCircle className="h-4 w-4"/>}>
                    Add a property
                  </LinkButton>} secondary={<LinkButton to="/owner/dashboard" variant="ghost" size="sm">
                    Back to overview
                  </LinkButton>}/>
            </div>) : (<>
              <div className="hidden overflow-x-auto border-b border-ink-100 md:block">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <caption className="sr-only">Owner submissions with status, publication, rent, source and storage.</caption>
                  <thead className="surface-muted text-[11px] uppercase tracking-[0.08em] text-ink-500">
                    <tr>
                      <th scope="col" className="px-5 py-3 font-semibold">Record</th>
                      <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                      <th scope="col" className="px-5 py-3 font-semibold">Published</th>
                      <th scope="col" className="px-5 py-3 font-semibold">Rent</th>
                      <th scope="col" className="px-5 py-3 font-semibold">Source</th>
                      <th scope="col" className="px-5 py-3 font-semibold">Storage</th>
                      <th scope="col" className="px-5 py-3 font-semibold">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {visibleListings.map((item) => (<tr key={item.id ?? item.externalId}>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-ink-800">{item.title || 'Not available'}</p>
                        <p className="mt-0.5 break-all font-mono text-[10px] text-ink-400">{item.id ?? item.externalId ?? 'No id supplied'}</p>
                      </td>
                      <td className="px-5 py-3"><Badge tone={statusTone(item.status)}>{item.status ?? 'Not available'}</Badge></td>
                      <td className="px-5 py-3">
                        <Badge tone={item.published === true ? 'green' : 'neutral'}>
                          {item.published === true ? 'Published' : item.published === false ? 'Not published' : 'Not available'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-ink-700">{formatINR(item.prices?.rent)}</td>
                      <td className="px-5 py-3 text-ink-700">{item.source?.name ?? item.provider ?? 'Not available'}</td>
                      <td className="px-5 py-3 text-ink-700">{item.storage ?? item.persistence ?? 'Not available'}</td>
                      <td className="px-5 py-3 text-ink-700">{formatDate(item.submittedAt ?? item.createdAt)}</td>
                    </tr>))}
                  </tbody>
                </table>
              </div>
              <ul className="divide-y divide-ink-100 md:hidden">
                {visibleListings.map((item) => <RecordCard key={item.id ?? item.externalId} item={item}/>)}
              </ul>
            </>)}
          </div>
        </section>

        <section aria-labelledby="moderation-heading" className="card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-700">
              <ShieldCheck className="h-4 w-4" aria-hidden/>
            </span>
            <div>
              <h2 id="moderation-heading" className="font-display text-base font-bold text-ink-900">How moderation works</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
                New records are stored with a pending status and are not published. Moderation checks the details
                and ownership information before any record becomes a public listing. This page only displays the
                values returned by the submissions API; it does not change them.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageShell>);
}
