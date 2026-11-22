import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  LifeBuoy,
  Map,
  MessageCircleQuestion,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { FaqAccordion, type FaqEntry } from '@/components/content/FaqAccordion';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { LinkButton } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';

const GROUPS: Array<{
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  items: FaqEntry[];
}> = [
  {
    id: 'search',
    eyebrow: 'Search & discovery',
    title: 'Finding a place',
    description: 'How locations, radius, filters and the map work together in this demo.',
    items: [
      {
        question: 'How do I search for a place to stay?',
        answer: (
          <>
            <p>
              Start on the <Link className="font-semibold text-teal-700 hover:underline" to="/explore">explore page</Link>{' '}
              or use the search bar on the home page. Choose or type a place, pick a suggestion from the curated India
              index, then adjust the radius and filters. Results update from the same demo dataset.
            </p>
            <p>
              You can search by city, university, tech park or well-known locality. A free-form address search needs a
              geocoding provider and is not part of this frontend phase.
            </p>
          </>
        ),
      },
      {
        question: 'What does the search radius actually measure?',
        answer: (
          <>
            <p>
              The radius is a straight-line (great-circle) distance in kilometres from your selected search point. It
              is not a travel-time or road-distance boundary: a place 2 km away as the crow flies can take much longer
              to reach depending on roads and traffic.
            </p>
            <p>
              Any walking-time figure shown on a result is a rough estimate from that straight-line distance. Check
              the actual commute yourself before making a decision — and remember these are demo locations anyway.
            </p>
          </>
        ),
      },
      {
        question: 'Why do I see very few results for my location?',
        answer: (
          <>
            <p>
              The demo dataset is small and concentrated around a handful of Indian locations, so a narrow radius or
              several active filters can leave you with nothing. Try a wider radius, clear filters, or search from a
              city, university or tech hub in the suggestions list.
            </p>
            <p>
              An empty result here means “no sample listing matched”, not “no accommodation exists in that area”.
            </p>
          </>
        ),
      },
      {
        question: 'Can I search outside India or type any street address?',
        answer: (
          <p>
            No. The place index is intentionally India-focused and contains a curated set of real geographic reference
            points — cities, campuses, tech hubs and localities. These are not property listings, and arbitrary address
            geocoding would require an external provider in a later phase.
          </p>
        ),
      },
      {
        question: 'What is the difference between Explore and Map discovery?',
        answer: (
          <p>
            They use the same search state and results. <Link className="font-semibold text-teal-700 hover:underline" to="/explore">Explore</Link>{' '}
            presents results as a list or grid with filters; <Link className="font-semibold text-teal-700 hover:underline" to="/map">Map discovery</Link>{' '}
            draws the radius circle and demo markers so you can judge proximity visually. Selecting a marker highlights
            the corresponding result.
          </p>
        ),
      },
      {
        question: 'How do saved, recent and compare lists work?',
        answer: (
          <>
            <p>
              Saving an option, viewing its details and adding it to comparison all work without an account. Those IDs
              are kept in your browser's local storage, so they survive a refresh on the same browser but follow you to
              another device.
            </p>
            <p>
              You can compare up to four demo listings at once. Use the clear controls on the relevant pages, or clear
              this site's browser data to remove everything.
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: 'data',
    eyebrow: 'Demo data & verification',
    title: 'Can I trust what I see?',
    description: 'What the labels mean — and what they deliberately do not claim.',
    items: [
      {
        question: 'Are these real properties?',
        answer: (
          <p>
            No. Every listing is demonstration data, explicitly flagged as a demo. Titles, descriptions, prices,
            availability, imagery credits and contact fields are illustrative. There are no real properties, bookings,
            brokers or owners behind these cards.
          </p>
        ),
      },
      {
        question: 'What does a verification label mean here?',
        answer: (
          <>
            <p>
              In this build it is sample data that demonstrates how a checked listing might be presented in a future
              product. It is not proof of a site visit, identity check, document review or availability confirmation.
            </p>
            <p>
              The “verified only” filter shows how such a control would behave. A real verification state would need a
              documented process, an audit trail and a way to report mistakes.
            </p>
          </>
        ),
      },
      {
        question: 'Why do listings show a source and a last-updated date?',
        answer: (
          <p>
            Provenance matters: knowing where a fact came from and when it was checked is more useful than a polished
            card with no history. In this demo those fields are sample values. No external feed is connected and no
            date here represents a real inspection or refresh.
          </p>
        ),
      },
      {
        question: 'Can I report incorrect data or claim a listing as an owner?',
        answer: (
          <p>
            Not yet. The <Link className="font-semibold text-teal-700 hover:underline" to="/contact">contact form</Link> validates
            locally but does not send anything, and the owner pages are interface previews that publish nothing. A
            correction and ownership workflow is planned for a later phase, together with moderation and reviewed
            policies.
          </p>
        ),
      },
      {
        question: 'Are the photographs and review scores real?',
        answer: (
          <p>
            Images are illustrative and credited as such where shown. Review scores are absent on demo listings
            because there are no real stays to review; they will not be invented for this build.
          </p>
        ),
      },
    ],
  },
  {
    id: 'costs',
    eyebrow: 'Pricing & comparison',
    title: 'Understanding the numbers',
    description: 'How costs are split so two options can be compared fairly.',
    items: [
      {
        question: 'How is monthly expense calculated?',
        answer: (
          <>
            <p>
              It combines base rent, maintenance, electricity and food charges (only when they are not already
              included) plus any other recurring monthly amount. Deposit and brokerage are one-time move-in costs and
              are shown separately rather than being folded into the monthly figure.
            </p>
            <p>
              “First-month outflow” adds the recurring monthly expense to those one-time payments. Per-person monthly
              cost divides the recurring expense by the occupancy shown on the listing.
            </p>
          </>
        ),
      },
      {
        question: 'Is the advertised rent the same as what I would pay?',
        answer: (
          <p>
            Rarely. Rent is only one part of the picture. Always look at the full breakdown and at which services are
            included. The values here are illustrative, so they should never be treated as a quote or a market rate.
          </p>
        ),
      },
      {
        question: 'How does side-by-side comparison work?',
        answer: (
          <p>
            Add up to four demo listings from search or details pages, then open <Link className="font-semibold text-teal-700 hover:underline" to="/compare">Compare</Link>{' '}
            to view cost, distance, occupancy, amenities and other attributes together. Comparison is a decision aid,
            not a ranking or recommendation of any real place.
          </p>
        ),
      },
      {
        question: 'Can I use these prices to negotiate or budget in the real world?',
        answer: (
          <p>
            No. They are sample numbers chosen to exercise the interface. Use actual listings, local advice and your
            own budget before making a real commitment.
          </p>
        ),
      },
    ],
  },
  {
    id: 'trust',
    eyebrow: 'Assistant, owners & privacy',
    title: 'The rest of the product',
    description: 'What the assistant, owner tools and privacy draft actually do.',
    items: [
      {
        question: 'Is the AI assistant a real AI model?',
        answer: (
          <>
            <p>
              No. The <Link className="font-semibold text-teal-700 hover:underline" to="/assistant">assistant</Link> uses deterministic local rules. It
              recognises simple hints such as a budget, a radius, a stay type, Wi-Fi or food, then reorders the demo
              results you already have. It does not call an external AI service.
            </p>
            <p>
              It cannot confirm availability, invent a listing or give financial or legal advice. Its caveats are shown
              with every reply.
            </p>
          </>
        ),
      },
      {
        question: 'Does the assistant remember my conversations?',
        answer: (
          <p>
            No. Replies are generated in the browser from your current search context and demo results. There is no
            chat history stored on a server in this phase.
          </p>
        ),
      },
      {
        question: 'Can I list my property as an owner?',
        answer: (
          <p>
            The <Link className="font-semibold text-teal-700 hover:underline" to="/owner/dashboard">owner dashboard</Link>, add-property form and listing manager are
            interface previews. They do not publish a listing, store it on a server or generate owner leads.
          </p>
        ),
      },
      {
        question: 'What information does this site store about me?',
        answer: (
          <>
            <p>
              Only browser-local data: saved IDs, recently viewed IDs, up to four comparison IDs, your search state,
              and a demo session if you try the sign-in UI. The sign-in form creates a local preview session; no
              password is transmitted or stored, and no real account is registered.
            </p>
            <p>
              Opening map discovery requests tiles from OpenStreetMap, which is a third-party resource. There is no
              application backend collecting form entries. See the <Link className="font-semibold text-teal-700 hover:underline" to="/privacy">draft privacy policy</Link> for
              details and the draft terms for acceptable use.
            </p>
          </>
        ),
      },
      {
        question: 'Where do I send privacy or legal questions?',
        answer: (
          <p>
            The contact page explains that no channels are connected in this phase. Both policies are marked DRAFT and
            describe principles for a future integration rather than a live service or legal entity.
          </p>
        ),
      },
    ],
  },
];

const QUICK_LINKS = [
  { to: '/explore', label: 'Start a search', detail: 'Try location, radius and filters', icon: Search },
  { to: '/map', label: 'See it on a map', detail: 'Check the radius visually', icon: Map },
  { to: '/assistant', label: 'Ask the assistant', detail: 'Rules-based demo replies', icon: Sparkles },
];

export function FAQPage() {
  return (
    <PageShell
      eyebrow="Help centre"
      title="Frequently asked questions"
      description="Straight answers about searching, demo data, pricing, comparison, the assistant, owner tools and privacy."
      breadcrumbs={[{ label: 'FAQ' }]}
      actions={
        <LinkButton to="/explore" variant="secondary" leftIcon={<Compass className="h-4 w-4" aria-hidden />}>
          Explore demo stays
        </LinkButton>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className="card group flex items-start gap-3 p-5 transition hover:-translate-y-0.5 hover:border-teal-200"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-ink-900 group-hover:text-teal-700">{link.label}</span>
                <span className="mt-1 block text-xs leading-relaxed text-ink-500">{link.detail}</span>
              </span>
              <ArrowRight className="ml-auto mt-1 h-3.5 w-3.5 shrink-0 text-ink-300" aria-hidden />
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="space-y-12">
          {GROUPS.map((group) => (
            <section key={group.id} id={group.id} className="scroll-mt-24">
              <SectionHeading eyebrow={group.eyebrow} title={group.title} description={group.description} />
              <FaqAccordion items={group.items} defaultOpenIndex={0} />
            </section>
          ))}
        </div>

        <aside className="lg:order-2" aria-label="On this page">
          <nav className="card sticky top-24 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-400">On this page</p>
            <ul className="mt-3 space-y-1">
              {GROUPS.map((group) => (
                <li key={group.id}>
                  <a href={`#${group.id}`} className="block rounded-lg px-2 py-2 text-xs font-medium text-ink-600 transition hover:bg-ink-50 hover:text-teal-700">
                    {group.eyebrow}
                  </a>
                </li>
              ))}
            </ul>
            <div className="hairline mt-4 pt-4">
              <p className="flex items-center gap-2 text-[11px] font-semibold text-ink-700">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-600" aria-hidden />
                Demo-first product
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-ink-500">
                No real listings, contacts or prices are shown anywhere in this build.
              </p>
            </div>
          </nav>
        </aside>
      </div>

      <section className="mt-12 flex flex-col gap-5 rounded-2xl border border-ink-100 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7" aria-labelledby="still-stuck-heading">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink-50 text-ink-700">
            <LifeBuoy className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 id="still-stuck-heading" className="font-display text-lg font-bold text-ink-950">
              Still have a question?
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-500">
              The contact form is ready for a real channel, but it cannot send anything today. The FAQ, assistant and
              draft policies are the best sources of answers in this phase.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <LinkButton to="/contact" variant="outline" size="sm" leftIcon={<MessageCircleQuestion className="h-4 w-4" aria-hidden />}>
            Contact page
          </LinkButton>
          <LinkButton to="/terms" variant="ghost" size="sm">
            Draft terms
          </LinkButton>
        </div>
      </section>

      <p className="mt-5 text-xs text-ink-400">
        Looking for something specific? Use your browser's find function, or jump to a section using the list above.
        <Badge tone="neutral" className="ml-2">
          Frontend demo
        </Badge>
      </p>
    </PageShell>
  );
}
