import { ArrowRight, BriefcaseBusiness, Clock3, Compass, Database, FileClock, GraduationCap, Heart, LockKeyhole, MapPin, Route, ShieldCheck, SlidersHorizontal, Sparkles, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
import { LinkButton } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';

const STEPS = [
  {
    number: '01',
    icon: MapPin,
    title: 'Pick a starting point',
    description: 'Search any Indian city, locality, landmark, office or address. The backend geocoder resolves it to coordinates.',
  },
  {
    number: '02',
    icon: SlidersHorizontal,
    title: 'Set a comfortable radius',
    description: 'Choose how far you are willing to look, then narrow by category, amenities and other supplied attributes.',
  },
  {
    number: '03',
    icon: Route,
    title: 'Read distance in context',
    description: 'Results show straight-line distance and a rough walking-time estimate; the map draws the same radius around your centre.',
  },
  {
    number: '04',
    icon: Wallet,
    title: 'Inspect supplied costs',
    description: 'When a record includes recurring charges or one-time payments they are separated. Otherwise the field reads “Not available”.',
  },
  {
    number: '05',
    icon: Heart,
    title: 'Keep a shortlist',
    description: 'Save records for later on this device and sign in with the API if you want an account alongside your activity.',
  },
];

const PRINCIPLES = [
  {
    icon: Database,
    title: 'Real records, attributed',
    description: 'Accommodation places come from OpenStreetMap with source metadata. No portal scraping and no invented inventory.',
  },
  {
    icon: LockKeyhole,
    title: 'No invented contacts',
    description: 'OpenStreetMap place records do not carry owner identity or phone numbers. Those fields read “Not available” instead of being fabricated.',
  },
  {
    icon: Wallet,
    title: 'Missing economics stay missing',
    description: 'Rent, deposit and availability are not inferred from map data. Supplied figures are separated from one-time costs and shown with provenance.',
  },
  {
    icon: FileClock,
    title: 'Provenance over polish',
    description: 'Source and update fields make it clear where a fact came from and when it was checked. Unverified stays unverified until evidence exists.',
  },
  {
    icon: ShieldCheck,
    title: 'State persistence plainly',
    description: 'The API persists accounts and messages in MongoDB when configured, otherwise in a local development file. Browser lists are labelled separately.',
  },
  {
    icon: Sparkles,
    title: 'The assistant stays grounded',
    description: 'It reorders the records you can already see using local rules. It never invents places, availability, prices or reviews.',
  },
];

const BLOCKERS = [
  {
    title: 'No partner APIs',
    detail: 'No authorised portal or provider feed supplies rental inventory. Partnerships would be required before prices or availability could be claimed.',
  },
  {
    title: 'No Google Places key',
    detail: 'No billing-enabled Google Places key is configured. Places data would help with discovery and contact attribution, but not with rent or room inventory.',
  },
  {
    title: 'No email delivery',
    detail: 'Password reset and message notifications are not delivered. The reset page reports this status and no confirmation email is sent.',
  },
  {
    title: 'No paid data',
    detail: 'No paid listing dataset is purchased or resold, and no scraped data is substituted when a source is unavailable.',
  },
];

function BulletList({ items, tone }) {
  return (<ul className="mt-4 space-y-3">
      {items.map((item) => (<li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-600">
          <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${tone === 'problem' ? 'bg-orange-50 text-orange-700' : 'bg-teal-50 text-teal-700'}`} aria-hidden>
            {tone === 'problem' ? '!' : '✓'}
          </span>
          {item}
        </li>))}
    </ul>);
}

export function AboutPage() {
  return (<PageShell eyebrow="About Nivasa" title="A clearer way to explore places to stay in India" description="Nivasa searches genuine OpenStreetMap accommodation records through a real API, with source attribution and honest gaps." breadcrumbs={[{ label: 'About' }]} actions={<LinkButton to="/search" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden/>}>
        Search records
      </LinkButton>}>
    <section className="grid gap-5 lg:grid-cols-[1.35fr_1fr]" aria-labelledby="mission-heading">
      <div className="card p-6 sm:p-8">
        <Badge tone="teal" icon={<Compass className="h-3 w-3" aria-hidden/>}>Our mission</Badge>
        <h2 id="mission-heading" className="mt-4 font-display text-2xl font-extrabold leading-snug tracking-tight text-ink-950 sm:text-3xl">
          Finding a room should not feel like guessing.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-ink-600">
          Students and working professionals in India often choose a home from scattered social-media posts, outdated
          directories and listings that show one rent number but hide the rest of the monthly spend. The decision is
          time-sensitive, personal and expensive to get wrong — yet the information is rarely organised for the person
          making it.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-600">
          Nivasa starts with the question people actually ask: <em>what is near the place I need to be, and what does the
          source actually tell me?</em> We use OpenStreetMap records and transparent gaps instead of presenting guesses
          as a live marketplace.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/faq" className="text-sm font-semibold text-teal-700 hover:underline">Read the FAQ</Link>
          <span className="text-ink-300" aria-hidden>·</span>
          <Link to="/contact" className="text-sm font-semibold text-teal-700 hover:underline">Send a message</Link>
        </div>
      </div>
      <div className="rounded-2xl border border-ink-100 bg-ink-900 p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">Where we begin</p>
        <h3 className="mt-3 font-display text-xl font-bold">India first, locality by locality</h3>
        <ul className="mt-5 space-y-4 text-sm leading-relaxed text-white/70">
          <li className="flex gap-3">
            <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-saffron-400" aria-hidden/>
            <span>Campuses and universities as meaningful search anchors, not just city names.</span>
          </li>
          <li className="flex gap-3">
            <BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0 text-saffron-400" aria-hidden/>
            <span>Tech parks and offices, because a short commute can matter more than a small rent cut.</span>
          </li>
          <li className="flex gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-saffron-400" aria-hidden/>
            <span>Real place names and coordinates from OpenStreetMap — never presented as rental inventory.</span>
          </li>
          <li className="flex gap-3">
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-saffron-400" aria-hidden/>
            <span>Coverage follows mapped places, so some areas have few records while others have many.</span>
          </li>
        </ul>
      </div>
    </section>

    <section className="mt-12" aria-labelledby="problem-heading">
      <SectionHeading eyebrow="Why we started" title="The problem is not a lack of options. It is a lack of clarity." description="A record can look complete while still leaving the most important questions unanswered."/>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <Badge tone="orange">The problem</Badge>
          <h3 id="problem-heading" className="mt-4 font-display text-lg font-bold text-ink-950">Too much noise, too little certainty</h3>
          <BulletList tone="problem" items={[
            'Rent is quoted alone, while deposit, maintenance, electricity, food and brokerage appear later.',
            '“Near the campus” can mean anything, with no radius or distance to check it against.',
            'Availability and update dates are often missing, so stale options look current.',
            'Contact details and review scores are easy to fake and hard to interpret.',
          ]}/>
        </div>
        <div className="card border-teal-200 p-6">
          <Badge tone="teal">Our approach</Badge>
          <h3 className="mt-4 font-display text-lg font-bold text-ink-950">Make the trade-offs visible</h3>
          <BulletList tone="solution" items={[
            'Search from a resolved point with an explicit radius instead of browsing endless feeds.',
            'Separate supplied recurring charges from one-time move-in payments.',
            'Put list and map views on the same result set so distances can be checked visually.',
            'Label sources, verification states and unavailable fields plainly — never fill gaps with invented details.',
          ]}/>
        </div>
      </div>
    </section>

    <section className="mt-12">
      <SectionHeading eyebrow="How it works" title="Discovery in five steps" description="The flow runs against records returned by the Nivasa API and attributed OpenStreetMap data."/>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (<div key={step.number} className="card flex flex-col p-5">
              <div className="flex items-center justify-between">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
                  <Icon className="h-4 w-4" aria-hidden/>
                </span>
                <span className="font-display text-lg font-extrabold text-ink-400">{step.number}</span>
              </div>
              <h3 className="mt-4 text-sm font-bold text-ink-900">{step.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-500">{step.description}</p>
            </div>);
        })}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <LinkButton to="/search" variant="secondary" size="sm">Try the search flow</LinkButton>
        <LinkButton to="/map" variant="outline" size="sm">Open map search</LinkButton>
        <LinkButton to="/assistant" variant="ghost" size="sm">Ask the assistant</LinkButton>
      </div>
    </section>

    <section className="mt-12">
      <SectionHeading eyebrow="Data integrity" title="Honest gaps beat convincing fiction" description="These principles guide what the interface is allowed to show when a source does not provide a field."/>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRINCIPLES.map((principle) => {
          const Icon = principle.icon;
          return (<div key={principle.title} className="rounded-2xl border border-ink-100 bg-white p-5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-50 text-ink-700">
                <Icon className="h-4 w-4" aria-hidden/>
              </span>
              <h3 className="mt-4 text-sm font-bold text-ink-900">{principle.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-500">{principle.description}</p>
            </div>);
        })}
      </div>
    </section>

    <section className="mt-12">
      <SectionHeading eyebrow="Current blockers" title="What is genuinely unavailable today" description="These gaps are reported, never replaced with invented data."/>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BLOCKERS.map((item) => (<div key={item.title} className="card p-5">
            <Badge tone="amber">Not available</Badge>
            <h3 className="mt-3 text-sm font-bold text-ink-900">{item.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-500">{item.detail}</p>
          </div>))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-ink-500">
        Records and messages are persisted in MongoDB when configured, otherwise in a local development file. Partner
        feeds and verified rental economics require authorised sources before anything can be presented as live
        availability.
      </p>
    </section>

    <section className="mt-12 overflow-hidden rounded-3xl bg-ink-900 px-6 py-8 text-white sm:px-9" aria-labelledby="cta-heading">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">See it for yourself</p>
          <h2 id="cta-heading" className="mt-2 font-display text-2xl font-extrabold tracking-tight">
            Explore the flow, then tell us what is missing.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/65">
            Search real mapped places, check what each source actually says, and use the contact form to send a message
            that is stored by the API.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <LinkButton to="/search" variant="secondary">Start searching</LinkButton>
          <LinkButton to="/contact" variant="outline">Share feedback</LinkButton>
        </div>
      </div>
    </section>
  </PageShell>);
}
