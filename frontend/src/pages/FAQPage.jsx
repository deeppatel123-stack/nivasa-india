import { Link } from 'react-router-dom';
import { ArrowRight, Compass, LifeBuoy, Map, MessageCircleQuestion, Search, ShieldCheck, Sparkles } from 'lucide-react';
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
    description: 'How the geocoder, radius, filters and map work together.',
    items: [
      {
        question: 'How do I search for a place to stay?',
        answer: (<>
          <p>
            Start on the <Link className="font-semibold text-teal-700 hover:underline" to="/search">search page</Link> or
            use the search bar on the home page. Enter a city, locality, landmark, office or full address in India.
            Suggestions and resolution come from OpenStreetMap-based geocoding services through the Nivasa API.
          </p>
          <p>
            After a place is resolved, choose a radius and filters. Results come from genuine OpenStreetMap accommodation
            records near that point. No sample inventory is substituted when a search returns nothing.
          </p>
        </>),
      },
      {
        question: 'What does the search radius measure?',
        answer: (<>
          <p>
            The radius is a straight-line (great-circle) distance in kilometres from the selected search point. It is
            not a travel-time or road-distance boundary: a place 2 km away as the crow flies can take much longer to
            reach depending on roads and traffic.
          </p>
          <p>
            Any walking-time figure is a rough estimate from that straight-line distance. Check the actual commute
            yourself before making a decision.
          </p>
        </>),
      },
      {
        question: 'Why do I see few or no results for my location?',
        answer: (<>
          <p>
            OpenStreetMap only contains places that contributors have mapped. A narrow radius or several active filters
            can leave you with nothing. Try a wider radius, clear filters, or search from a nearby landmark.
          </p>
          <p>
            An empty result means “no matching record was found”, not “no accommodation exists in that area”.
          </p>
        </>),
      },
      {
        question: 'Can I search outside India or type any street address?',
        answer: (<p>
          The product is India-focused. The backend geocoder can resolve a broad range of Indian places, but it depends
          on provider coverage. Free-form addresses require the geocoding service to be available; no curated local
          index decides what you may type.
        </p>),
      },
      {
        question: 'How are Explore and Map search different?',
        answer: (<p>
          They use the same search state and results. <Link className="font-semibold text-teal-700 hover:underline" to="/search">Search</Link>{' '}
          presents records as a list or grid with filters; <Link className="font-semibold text-teal-700 hover:underline" to="/map">Map search</Link>{' '}
          draws the radius circle so you can judge proximity visually. Selecting a marker highlights the matching
          record.
        </p>),
      },
      {
        question: 'How do saved, recent and compare lists work?',
        answer: (<>
          <p>
            You can save a record, revisit it and compare up to four records without an account. Those IDs and snapshots
            live in this browser's local storage, so they survive a refresh here but do not follow you to another
            device. Use the clear controls on each page to remove them.
          </p>
          <p>
            Accounts are separate: <Link className="font-semibold text-teal-700 hover:underline" to="/login">login</Link>{' '}
            and registration are handled by the API. Your profile shows the account and storage mode returned by the
            server.
          </p>
        </>),
      },
    ],
  },
  {
    id: 'data',
    eyebrow: 'Records & sources',
    title: 'Can I trust what I see?',
    description: 'What the labels, sources and “Not available” fields actually mean.',
    items: [
      {
        question: 'Where do the records come from?',
        answer: (<p>
          Accommodation places are read from OpenStreetMap through the backend discovery service, with source
          attribution and update information where available. Owner or provider submissions can also be stored with
          provenance. No listing portal is scraped, no access controls are bypassed, and no paid data is purchased.
        </p>),
      },
      {
        question: 'Are rent, availability and contact details real?',
        answer: (<>
          <p>
            OpenStreetMap place records generally do not include rent, deposit, availability or owner contact details.
            Nivasa shows <strong>Not available</strong> for those fields instead of inventing values. A submitted record
            may include some details, but it stays unverified and pending moderation until evidence supports another
            state.
          </p>
          <p>
            Treat any shown figure as information from its stated source, not as a quote or an offer.
          </p>
        </>),
      },
      {
        question: 'What does a verification label mean here?',
        answer: (<p>
          A verification state only reflects recorded evidence and its source. OpenStreetMap-derived records are
          unverified unless a documented check exists. No label is proof of a site visit, identity check, document
          review or confirmed availability.
        </p>),
      },
      {
        question: 'Can I report incorrect data or submit a property?',
        answer: (<p>
          Yes. The <Link className="font-semibold text-teal-700 hover:underline" to="/contact">contact form</Link> posts a
          message to the API and returns a record id. Property submissions are stored with provenance and a pending
          moderation state. No email notification is generated because email delivery is not configured.
        </p>),
      },
      {
        question: 'Are photographs and review scores real?',
        answer: (<p>
          Images are shown only when an attributed source provides them. Review scores appear only where a real,
          moderated stay supports them; otherwise the field is left unavailable rather than invented.
        </p>),
      },
    ],
  },
  {
    id: 'costs',
    eyebrow: 'Costs & comparison',
    title: 'Understanding the numbers',
    description: 'How missing economics and supplied figures are handled.',
    items: [
      {
        question: 'How is monthly expense calculated?',
        answer: (<>
          <p>
            When a record supplies recurring charges, the breakdown separates base rent, maintenance, electricity, food
            and other monthly amounts, excluding anything already included. Deposit and brokerage are shown separately
            as one-time move-in costs.
          </p>
          <p>
            When those fields are absent — which is common for OpenStreetMap places — they read “Not available”. No
            estimated rent is generated to fill the gap.
          </p>
        </>),
      },
      {
        question: 'Can I use these figures to negotiate or budget?',
        answer: (<p>
          Only if the source and freshness shown with the record support it, and only as a starting point. Confirm the
          actual amount, what is included and whether the place is still available with the source directly.
        </p>),
      },
      {
        question: 'How does side-by-side comparison work?',
        answer: (<p>
          Add up to four records from search or detail pages, then open <Link className="font-semibold text-teal-700 hover:underline" to="/compare">Compare</Link>{' '}
          to view supplied cost, distance, occupancy and attributes together. Comparison is a decision aid, not a
          ranking or a recommendation.
        </p>),
      },
    ],
  },
  {
    id: 'platform',
    eyebrow: 'Accounts, storage & gaps',
    title: 'How the service is built',
    description: 'What is connected today, what is stored where, and what is still unavailable.',
    items: [
      {
        question: 'Is the assistant a real AI model?',
        answer: (<>
          <p>
            No. The <Link className="font-semibold text-teal-700 hover:underline" to="/assistant">assistant</Link> uses
            deterministic local rules over the records already in your current results. It recognises simple hints such
            as a budget, radius, stay type or amenity and reorders what you can see. It does not call an external AI
            service.
          </p>
          <p>
            It cannot confirm availability, invent a record or give financial or legal advice.
          </p>
        </>),
      },
      {
        question: 'Where are accounts, messages and records stored?',
        answer: (<>
          <p>
            The API persists accounts, contact messages and submissions in MongoDB when a connection is configured;
            otherwise it writes to a local development file. Listing records read from OpenStreetMap are returned with
            source metadata rather than copied into a fabricated catalogue.
          </p>
          <p>
            Your browser separately stores the session token, cached account, shortlist, recent records and search
            state. <Link className="font-semibold text-teal-700 hover:underline" to="/profile">Signing out</Link> clears
            the token and cached account here.
          </p>
        </>),
      },
      {
        question: 'What is not connected yet?',
        answer: (<>
          <p>
            Four current blockers: no partner listing APIs, no billing-enabled Google Places key, no email delivery for
            resets or notifications, and no paid data feeds. These are shown as “Not available” rather than replaced
            with invented content.
          </p>
          <p>
            Because rental economics are absent from OpenStreetMap place data, a complete live listing product needs
            authorised feeds or verified owner submissions before it can claim prices or availability.
          </p>
        </>),
      },
      {
        question: 'Where do I send privacy or legal questions?',
        answer: (<p>
          The <Link className="font-semibold text-teal-700 hover:underline" to="/contact">contact page</Link> stores a
          message through the API and returns a reference id. Email delivery is not configured, so there is no published
          support address. The <Link className="font-semibold text-teal-700 hover:underline" to="/privacy">draft privacy policy</Link>{' '}
          and <Link className="font-semibold text-teal-700 hover:underline" to="/terms">draft terms</Link> explain the
          current handling of data.
        </p>),
      },
    ],
  },
];

const QUICK_LINKS = [
  { to: '/search', label: 'Start a search', detail: 'Resolve any Indian location', icon: Search },
  { to: '/map', label: 'See it on a map', detail: 'Check the radius visually', icon: Map },
  { to: '/assistant', label: 'Ask the assistant', detail: 'Rules-based help over your results', icon: Sparkles },
];

export function FAQPage() {
  return (<PageShell eyebrow="Help centre" title="Frequently asked questions" description="Straight answers about searching, record sources, costs, comparison, accounts and current gaps." breadcrumbs={[{ label: 'FAQ' }]} actions={<LinkButton to="/search" variant="secondary" leftIcon={<Compass className="h-4 w-4" aria-hidden/>}>
        Search records
      </LinkButton>}>
    <div className="grid gap-4 sm:grid-cols-3">
      {QUICK_LINKS.map((link) => {
        const Icon = link.icon;
        return (<Link key={link.to} to={link.to} className="card group flex items-start gap-3 p-5 transition hover:-translate-y-0.5 hover:border-teal-200">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <Icon className="h-4 w-4" aria-hidden/>
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-ink-900 group-hover:text-teal-700">{link.label}</span>
              <span className="mt-1 block text-xs leading-relaxed text-ink-500">{link.detail}</span>
            </span>
            <ArrowRight className="ml-auto mt-1 h-3.5 w-3.5 shrink-0 text-ink-300" aria-hidden/>
          </Link>);
      })}
    </div>

    <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div className="space-y-12">
        {GROUPS.map((group) => (<section key={group.id} id={group.id} className="scroll-mt-24">
            <SectionHeading eyebrow={group.eyebrow} title={group.title} description={group.description}/>
            <FaqAccordion items={group.items} defaultOpenIndex={0}/>
          </section>))}
      </div>

      <aside className="lg:order-2" aria-label="On this page">
        <nav className="card sticky top-24 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-400">On this page</p>
          <ul className="mt-3 space-y-1">
            {GROUPS.map((group) => (<li key={group.id}>
                <a href={`#${group.id}`} className="block rounded-lg px-2 py-2 text-xs font-medium text-ink-600 transition hover:bg-ink-50 hover:text-teal-700">
                  {group.eyebrow}
                </a>
              </li>))}
          </ul>
          <div className="hairline mt-4 pt-4">
            <p className="flex items-center gap-2 text-[11px] font-semibold text-ink-700">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600" aria-hidden/>
              Records first
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-ink-500">
              OpenStreetMap sources, honest “Not available” fields and no scraping of listing portals.
            </p>
          </div>
        </nav>
      </aside>
    </div>

    <section className="mt-12 flex flex-col gap-5 rounded-2xl border border-ink-100 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7" aria-labelledby="still-stuck-heading">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-700">
          <LifeBuoy className="h-5 w-5" aria-hidden/>
        </span>
        <div>
          <h2 id="still-stuck-heading" className="font-display text-lg font-bold text-ink-950">Still have a question?</h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-500">
            The contact page stores your message through the API and returns a reference id. No email reply is promised;
            the FAQ, assistant and draft policies are the fastest sources of answers.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-3">
        <LinkButton to="/contact" variant="outline" size="sm" leftIcon={<MessageCircleQuestion className="h-4 w-4" aria-hidden/>}>
          Contact page
        </LinkButton>
        <LinkButton to="/terms" variant="ghost" size="sm">Draft terms</LinkButton>
      </div>
    </section>

    <p className="mt-5 flex flex-wrap items-center gap-2 text-xs text-ink-400">
      Looking for something specific? Use your browser's find function, or jump to a section using the list above.
      <Badge tone="neutral">Draft docs</Badge>
    </p>
  </PageShell>);
}
