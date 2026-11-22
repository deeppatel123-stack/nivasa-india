import { Link } from 'react-router-dom';
import { DraftPolicyBanner, PolicyFooterNav, PolicyList, PolicySection } from '@/components/content/PolicyDocument';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';
const LOCAL_KEYS = [
    { key: 'nivasa.search', detail: 'Search text, radius, filters, sort choice and resolved reference location.' },
    { key: 'nivasa.saved', detail: 'IDs of demo listings you saved for later.' },
    { key: 'nivasa.compare', detail: 'Up to four demo listing IDs selected for side-by-side comparison.' },
    { key: 'nivasa.recently-viewed', detail: 'Up to twelve recently opened demo listing IDs.' },
    { key: 'nivasa.demo.session', detail: 'A locally created preview profile (name and email) if you use the demo sign-in form.' },
];
export function PrivacyPage() {
    return (<PageShell eyebrow="Draft policy · frontend demo" title="Privacy policy (draft)" description="A plain-language draft explaining what this demonstration stores in your browser — and what it does not collect at all." breadcrumbs={[{ label: 'Privacy policy' }]} actions={<Badge tone="amber">DRAFT — not a published policy</Badge>}>
      <DraftPolicyBanner title="Draft privacy policy for the Nivasa frontend demo"/>

      <section className="card mt-6 p-5 sm:p-6" aria-labelledby="privacy-at-a-glance">
        <h2 id="privacy-at-a-glance" className="font-display text-lg font-bold text-ink-950">
          At a glance
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            'No backend, database or analytics service is connected to this build.',
            'No real account is created; the sign-in screens are UI previews.',
            'Every property is illustrative demo data with no real contact details.',
            'The contact form validates locally and sends nothing.',
            'A few preferences are saved in the local storage of your own browser.',
            'Map tiles are loaded from OpenStreetMap when you open map discovery.',
        ].map((item) => (<div key={item} className="surface-muted flex items-start gap-2.5 rounded-xl p-3.5 text-xs leading-relaxed text-ink-600">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden/>
              {item}
            </div>))}
        </div>
      </section>

      <div className="mt-6 space-y-5">
        <PolicySection id="privacy-scope" number={1} title="Scope and status of this draft">
          <p>
            This document describes the current frontend demonstration of Nivasa, an India-focused accommodation
            discovery concept. It is a draft for review, not a legal notice from a registered organisation. It does not
            apply to any third-party website and does not govern a live service, because no live service is offered
            here.
          </p>
          <p>
            If a production version is ever built, this draft should be replaced with a reviewed policy before any real
            personal information is collected.
          </p>
        </PolicySection>

        <PolicySection id="privacy-not-collected" number={2} title="What this build does not collect">
          <PolicyList>
            <li>
              <strong>No contact submissions:</strong> the contact form checks fields in your browser and shows a
              notification, but it has no recipient, inbox, ticket queue or server. Text typed there is not transmitted
              or retained by this demo.
            </li>
            <li>
              <strong>No real accounts:</strong> sign-up, sign-in, Google sign-in preview and password-reset screens do
              not verify credentials or create an account on a server. A local preview profile is the only exception,
              described below.
            </li>
            <li>
              <strong>No property data about real people:</strong> all listings are flagged demonstration data. They
              have no real owner, tenant, phone number, email address, booking history or review.
            </li>
            <li>
              <strong>No payments or documents:</strong> the demo does not process rent, deposits, identity documents or
              financial information. Do not enter such details into any demo form.
            </li>
            <li>
              <strong>No application analytics or advertising trackers:</strong> this build does not intentionally
              include tracking scripts or ad networks. Browser-level requests needed to load the app and map tiles are
              a separate matter, described below.
            </li>
          </PolicyList>
        </PolicySection>

        <PolicySection id="privacy-local-storage" number={3} title="Information stored in your browser">
          <p>
            The demo uses browser local storage so that your shortlist and preferences survive a page refresh. Local
            storage stays on the device and browser profile you are using; this application has no server copy of it.
            The keys used are:
          </p>
          <ul className="ml-5 list-disc space-y-2 marker:text-teal-600">
            {LOCAL_KEYS.map((item) => (<li key={item.key}>
                <code className="rounded bg-ink-50 px-1.5 py-0.5 text-[11px] font-semibold text-ink-700">{item.key}</code>{' '}
                — {item.detail}
              </li>))}
          </ul>
          <p>
            Passwords typed into the demo sign-in screens are not written to storage. The local preview profile stores
            only a generated demo ID, a display name, an email string and the preview provider label. Assistant replies
            are generated locally from the current search context and are not stored as a conversation history.
          </p>
        </PolicySection>

        <PolicySection id="privacy-third-party" number={4} title="Third-party resources and map tiles">
          <p>
            Map discovery renders tiles from OpenStreetMap. When you open a map, your browser requests those tiles
            directly from that provider, so the provider may receive ordinary request information such as your IP
            address. Tile attribution is shown in the interface; that service has its own privacy practices which this
            draft does not control.
          </p>
          <p>
            The project also links to an external source-code repository in the footer. Following that link takes you
            outside this demo and is governed by the destination's own terms.
          </p>
        </PolicySection>

        <PolicySection id="privacy-future" number={5} title="Principles for any future integration">
          <p>
            Should real listings, accounts or messaging be introduced, this draft proposes the following principles.
            They describe intended design constraints, not a current legal commitment:
          </p>
          <PolicyList>
            <li>Collect only the information needed for a clearly explained purpose, and say so at the point of entry.</li>
            <li>Publish a reviewed policy before collecting real personal data, and obtain consent where appropriate.</li>
            <li>Keep one-time and recurring data separate in a real listing record, and show source and update times.</li>
            <li>Do not sell personal information or use contact details for unrelated marketing without explicit permission.</li>
            <li>Define retention periods, access controls and deletion routes before any backend goes live.</li>
            <li>Add a moderation and correction process for listing data, with an audit trail of changes.</li>
          </PolicyList>
        </PolicySection>

        <PolicySection id="privacy-rights" number={6} title="Your choices and data rights">
          <p>
            Because there is no application server, there is no profile for us to access, correct, export or delete.
            You remain in control of the data in your own browser and can remove it at any time:
          </p>
          <PolicyList>
            <li>Use the clear controls on pages such as saved listings, recently viewed and comparison where available.</li>
            <li>Sign out of the demo profile to remove the local preview session.</li>
            <li>Clear site data or local storage for this site in your browser settings to remove all of the keys listed above.</li>
          </PolicyList>
          <p>
            If a real service is introduced, a reviewed policy should explain how to request access, correction,
            deletion, restriction, portability or objection, along with contact routes and response expectations. No
            such process exists in this demo, and no compliance certification is claimed here.
          </p>
        </PolicySection>

        <PolicySection id="privacy-children" number={7} title="Children">
          <p>
            This demonstration is aimed at people making accommodation decisions and is not directed at children. No
            age verification is performed because no real service is provided. A production service would need a clear
            policy on age eligibility and any additional safeguards before collecting personal data.
          </p>
        </PolicySection>

        <PolicySection id="privacy-changes" number={8} title="Changes to this document">
          <p>
            This text may change as the demo evolves. Since nothing is submitted to a server, edits to this draft do not
            affect any personal data. Any future live service should present a clearly versioned, reviewed policy and
            notify users before that policy takes effect.
          </p>
        </PolicySection>

        <PolicySection id="privacy-contact" number={9} title="Questions and contact">
          <p>
            The <Link className="font-semibold text-teal-700 hover:underline" to="/contact">contact page</Link> explains that
            no email, phone or messaging channel is connected in this phase, so privacy questions cannot be received
            through the demo form. Please do not send personal or sensitive information through any frontend form.
          </p>
          <p>
            This draft is provided to make the intended data practices reviewable. It is not legal advice and should not
            be relied on as a completed privacy notice.
          </p>
        </PolicySection>
      </div>

      <PolicyFooterNav current="privacy"/>
    </PageShell>);
}
