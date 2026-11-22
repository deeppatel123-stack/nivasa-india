import { ArrowRight, BriefcaseBusiness, Clock3, Compass, FileClock, GraduationCap, Heart, LockKeyhole, MapPin, Route, ShieldCheck, SlidersHorizontal, Sparkles, Wallet, } from 'lucide-react';
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
        description: 'Search a city, university, tech park or locality from the curated India index. That point becomes the centre of your search.',
    },
    {
        number: '02',
        icon: SlidersHorizontal,
        title: 'Set a comfortable radius',
        description: 'Choose how far you are willing to look, then narrow by stay type, furnishing, occupancy, amenities and budget.',
    },
    {
        number: '03',
        icon: Route,
        title: 'Read distance in context',
        description: 'Results show approximate straight-line distance and a rough walking-time estimate; the map draws the same radius around your centre.',
    },
    {
        number: '04',
        icon: Wallet,
        title: 'Compare the full monthly cost',
        description: 'Recurring charges and one-time move-in payments are shown separately. Compare up to four options side by side before deciding.',
    },
    {
        number: '05',
        icon: Heart,
        title: 'Keep a shortlist',
        description: 'Save options and revisit them in your own browser. Nothing is published, shared or sent to an owner in this phase.',
    },
];
const PRINCIPLES = [
    {
        icon: ShieldCheck,
        title: 'Demo data, labelled everywhere',
        description: 'Every property in this build is marked as demonstration data. No sample listing is presented as a real, available place.',
    },
    {
        icon: LockKeyhole,
        title: 'No invented contacts',
        description: 'Demo listings carry no phone number, email address or owner identity. We would rather show “not available” than fabricate a way to reach someone.',
    },
    {
        icon: Wallet,
        title: 'Costs are explained',
        description: 'Monthly charges and one-time payments are separated, and included services are never double-counted. The figures are illustrative, not market quotes.',
    },
    {
        icon: FileClock,
        title: 'Provenance over polish',
        description: 'Source and last-updated fields exist so a future service can show where a fact came from and when it was checked. Here they are sample values.',
    },
    {
        icon: Compass,
        title: 'Verification is not a promise',
        description: 'A verification label demonstrates how a checked listing might be presented. It is not evidence of a site visit, a document check or a guarantee.',
    },
    {
        icon: Sparkles,
        title: 'The assistant stays grounded',
        description: 'The assistant reorders the demo results you can already see. It never invents properties, availability, prices or reviews.',
    },
];
const ROADMAP = [
    {
        title: 'Real, sourced listings',
        description: 'Connect partner and owner feeds with visible source labels, update times and a moderation queue before anything is shown as live.',
    },
    {
        title: 'A verification workflow',
        description: 'Define exactly what is checked, when it was checked and by whom — with an audit trail instead of a single trust badge.',
    },
    {
        title: 'Enquiries that go somewhere',
        description: 'Owner messaging, response expectations and a data-correction path, launched together with a reviewed privacy policy.',
    },
    {
        title: 'Locality signals that help',
        description: 'Commute-aware search, clearer availability windows and rent breakdowns that make neighbourhood trade-offs easier to judge.',
    },
    {
        title: 'Moderated reviews',
        description: 'Reviews only where there is a real stay to review, with published rules and a route to challenge incorrect content.',
    },
    {
        title: 'Owner publishing tools',
        description: 'Let owners manage their own listings with explicit consent, edit history and a clear takedown process.',
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
    return (<PageShell eyebrow="About Nivasa" title="A clearer way to find a place to stay in India" description="Nivasa is a frontend demonstration of calmer, more honest accommodation discovery — built around location, total cost and clearly labelled data." breadcrumbs={[{ label: 'About' }]} actions={<LinkButton to="/explore" rightIcon={<ArrowRight className="h-4 w-4" aria-hidden/>}>
          Explore demo stays
        </LinkButton>}>
      <section className="grid gap-5 lg:grid-cols-[1.35fr_1fr]" aria-labelledby="mission-heading">
        <div className="card p-6 sm:p-8">
          <Badge tone="teal" icon={<Compass className="h-3 w-3" aria-hidden/>}>
            Our mission
          </Badge>
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
            We want discovery to start with the question people actually ask: <em>what is available near the place I need
            to be, at a cost I can genuinely plan for?</em> This build explores that question with illustrative data and
            no pretence of being a live marketplace.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/faq" className="text-sm font-semibold text-teal-700 hover:underline">
              Read the FAQ
            </Link>
            <span className="text-ink-300" aria-hidden>
              ·
            </span>
            <Link to="/contact" className="text-sm font-semibold text-teal-700 hover:underline">
              How to reach us later
            </Link>
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
              <span>Real place names and coordinates used as geographic references — never as property listings.</span>
            </li>
            <li className="flex gap-3">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-saffron-400" aria-hidden/>
              <span>A starting dataset concentrated around Ahmedabad, with a structure that can grow city by city.</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="problem-heading">
        <SectionHeading eyebrow="Why we started" title="The problem is not a lack of options. It is a lack of clarity." description="A listing page can look complete while still leaving the most important questions unanswered."/>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="card p-6">
            <Badge tone="orange">The problem</Badge>
            <h3 id="problem-heading" className="mt-4 font-display text-lg font-bold text-ink-950">
              Too much noise, too little certainty
            </h3>
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
            'Search from a chosen point with an explicit radius instead of browsing endless feeds.',
            'Show a comparable monthly expense alongside one-time move-in costs.',
            'Put list and map views on the same result set so distances can be checked visually.',
            'Label demo data, verification states and unavailable contacts plainly — never fill gaps with invented details.',
        ]}/>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading eyebrow="How it works" title="Discovery in five steps" description="The flow below is implemented with sample listings so the product decisions can be reviewed before real data exists."/>
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
          <LinkButton to="/explore" variant="secondary" size="sm">
            Try the search flow
          </LinkButton>
          <LinkButton to="/map" variant="outline" size="sm">
            Open map discovery
          </LinkButton>
          <LinkButton to="/assistant" variant="ghost" size="sm">
            Ask the demo assistant
          </LinkButton>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeading eyebrow="Data integrity" title="Honest gaps beat convincing fiction" description="These principles guide what the interface is allowed to show — especially while every listing is illustrative."/>
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
        <SectionHeading eyebrow="Coming next" title="What we would build before calling this a real service" description="Direction, not a promise: no launch dates or funding claims are attached to this frontend demo."/>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ROADMAP.map((item) => (<div key={item.title} className="card p-5">
              <Badge tone="blue">Planned</Badge>
              <h3 className="mt-3 text-sm font-bold text-ink-900">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-500">{item.description}</p>
            </div>))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-ink-500">
          Nothing in this section exists yet. Listings, pricing, owner tools and verification remain demonstrations until
          the corresponding data and review processes are in place.
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
              Every screen works with clearly labelled demo data, so you can judge the experience without mistaking it
              for a live listing service.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <LinkButton to="/explore" variant="secondary">
              Start exploring
            </LinkButton>
            <LinkButton to="/contact" variant="outline">
              Share feedback
            </LinkButton>
          </div>
        </div>
      </section>
    </PageShell>);
}
