import { Link } from 'react-router-dom';
import { ArrowRight, LifeBuoy, Map, MessageCircleQuestion, Search, ShieldCheck } from 'lucide-react';
import { FaqAccordion } from '@/components/content/FaqAccordion';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { LinkButton } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';

const GROUPS = [
  {
    id: 'search',
    eyebrow: 'Search & discovery',
    title: 'Finding a place',
    description: 'How search, radius, filters, and the map work.',
    items: [
      {
        question: 'How do I search for a place to stay?',
        answer: (
          <>
            <p>
              Use the search bar on the <Link className="font-semibold text-teal-700 hover:underline" to="/">home page</Link> or the{' '}
              <Link className="font-semibold text-teal-700 hover:underline" to="/search">search page</Link>. Enter a city, locality, landmark, office, or address anywhere in India.
            </p>
            <p>
              After selecting a location, choose a radius and apply filters to narrow results. You can browse in list or map view.
            </p>
          </>
        ),
      },
      {
        question: 'What does the search radius mean?',
        answer: (
          <p>
            The radius is the distance around your selected location. A smaller radius shows places closer by; a larger radius includes more options farther away. Distances are shown as straight-line estimates to help you compare.
          </p>
        ),
      },
      {
        question: 'Why do I see few or no results?',
        answer: (
          <p>
            Try widening the radius, removing some filters, or searching near a nearby landmark or locality. Some areas may have limited listings available at the moment.
          </p>
        ),
      },
      {
        question: 'What is the difference between Search and Map?',
        answer: (
          <p>
            <Link className="font-semibold text-teal-700 hover:underline" to="/search">Search</Link> shows results as a list with filters.{' '}
            <Link className="font-semibold text-teal-700 hover:underline" to="/map">Map</Link> shows the same results on a map so you can see where places are relative to your chosen location. You can switch between them anytime.
          </p>
        ),
      },
    ],
  },
  {
    id: 'details',
    eyebrow: 'Listings & details',
    title: 'Understanding listing information',
    description: 'What you see on listing cards and detail pages.',
    items: [
      {
        question: 'Why does some information say “Not available”?',
        answer: (
          <p>
            We only show details that are provided for a listing. If rent, availability, contact details, photos, or other information is missing, it is shown as “Not available” so you are not misled by guesses.
          </p>
        ),
      },
      {
        question: 'Can I trust the details I see?',
        answer: (
          <p>
            Nivasa aims to present information clearly and honestly. Always confirm important details like price, availability, and terms directly with the property owner or manager before making a decision.
          </p>
        ),
      },
      {
        question: 'How do I contact a property owner?',
        answer: (
          <p>
            On a property detail page, use the enquiry option when contact details are available. If contact information is not available, you can save the place and check back later.
          </p>
        ),
      },
    ],
  },
  {
    id: 'account',
    eyebrow: 'Account & saved places',
    title: 'Your account and activity',
    description: 'Saving, comparing, and managing your account.',
    items: [
      {
        question: 'Do I need an account to use Nivasa?',
        answer: (
          <p>
            You can search and browse without an account. Creating an account lets you save places, compare options, and manage your activity more easily.
          </p>
        ),
      },
      {
        question: 'What is the difference between seeker and owner accounts?',
        answer: (
          <>
            <p>
              <strong>Looking for a place:</strong> search, save, compare, and contact property owners.
            </p>
            <p>
              <strong>Property owner:</strong> submit and manage property listings, and track their review status.
            </p>
          </>
        ),
      },
      {
        question: 'How do saved places and compare work?',
        answer: (
          <p>
            You can save places you like and compare up to four at a time. This helps you review options side by side before deciding.
          </p>
        ),
      },
      {
        question: 'I forgot my password. What should I do?',
        answer: (
          <p>
            Go to the <Link className="font-semibold text-teal-700 hover:underline" to="/forgot-password">forgot password</Link> page. If password reset is available, you’ll be guided through the steps. If it’s not available right now, the page will let you know.
          </p>
        ),
      },
    ],
  },
  {
    id: 'owners',
    eyebrow: 'For owners',
    title: 'Listing a property',
    description: 'Submitting and managing your property.',
    items: [
      {
        question: 'How do I list my property?',
        answer: (
          <p>
            Create an owner account, then go to <Link className="font-semibold text-teal-700 hover:underline" to="/owner/add-property">Add property</Link>. Fill in the location, details, pricing, and contact information, then submit it for review.
          </p>
        ),
      },
      {
        question: 'When will my listing appear publicly?',
        answer: (
          <p>
            Submitted listings are reviewed before being published. You can check the status from your <Link className="font-semibold text-teal-700 hover:underline" to="/owner/listings">Manage listings</Link> page.
          </p>
        ),
      },
    ],
  },
];

const QUICK_LINKS = [
  { to: '/search', label: 'Search places', icon: Search },
  { to: '/map', label: 'Map view', icon: Map },
  { to: '/contact', label: 'Contact us', icon: MessageCircleQuestion },
  { to: '/privacy', label: 'Privacy policy', icon: ShieldCheck },
];

export function FAQPage() {
  return (
    <PageShell
      eyebrow="Help center"
      title="Frequently asked questions"
      description="Quick answers about searching, saving places, accounts, and listing properties on Nivasa."
      breadcrumbs={[{ label: 'FAQ' }]}
      actions={<Badge tone="teal" icon={<LifeBuoy className="h-3 w-3" aria-hidden />}>Help</Badge>}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-10">
          {GROUPS.map((group) => (
            <section key={group.id} aria-labelledby={`faq-${group.id}`}>
              <SectionHeading eyebrow={group.eyebrow} title={group.title} description={group.description} />
              <FaqAccordion items={group.items} idBase={`faq-${group.id}`} />
            </section>
          ))}
        </div>

        <aside className="space-y-5">
          <section className="card p-5">
            <h2 className="font-display text-base font-bold text-ink-950">Quick links</h2>
            <div className="mt-3 space-y-1">
              {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50 hover:text-teal-700">
                  <Icon className="h-4 w-4 text-ink-400" aria-hidden />
                  {label}
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-teal-200 bg-teal-50/50 p-5">
            <h2 className="font-display text-base font-bold text-teal-950">Still need help?</h2>
            <p className="mt-2 text-xs leading-relaxed text-teal-800">
              Can’t find what you’re looking for? Send us a message and we’ll help.
            </p>
            <LinkButton to="/contact" variant="secondary" size="sm" className="mt-4" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
              Contact us
            </LinkButton>
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
