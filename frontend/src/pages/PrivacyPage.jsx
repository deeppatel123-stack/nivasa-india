import { Link } from 'react-router-dom';
import { DraftPolicyBanner, PolicyFooterNav, PolicyList, PolicySection } from '@/components/content/PolicyDocument';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';

const LOCAL_KEYS = [
  { key: 'nivasa.search', detail: 'Search text, radius, filters, sort choice and resolved reference location.' },
  { key: 'nivasa.saved', detail: 'IDs and cached snapshots of records you saved.' },
  { key: 'nivasa.compare', detail: 'Up to four record IDs and snapshots selected for comparison.' },
  { key: 'nivasa.recently-viewed', detail: 'Up to twelve recently opened record IDs and snapshots.' },
  { key: 'nivasa.auth.token', detail: 'The bearer token issued by the API for your signed-in session.' },
  { key: 'nivasa.auth.user', detail: 'The cached account returned by /auth/me (id, name, email and role).' },
];

export function PrivacyPage() {
  return (<PageShell eyebrow="Draft policy" title="Privacy policy (draft)" description="A plain-language draft describing what Nivasa stores in your browser and what the API stores on the server." breadcrumbs={[{ label: 'Privacy policy' }]} actions={<Badge tone="amber">DRAFT — not a published policy</Badge>}>
    <DraftPolicyBanner title="Draft privacy policy for Nivasa"/>

    <section className="card mt-6 p-5 sm:p-6" aria-labelledby="privacy-at-a-glance">
      <h2 id="privacy-at-a-glance" className="font-display text-lg font-bold text-ink-950">At a glance</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[
          'Accommodation records come from OpenStreetMap and attributed submissions; no portal scraping is used.',
          'Missing rent, availability and contact fields are shown as “Not available”.',
          'Account and message information is handled securely to support your use of Nivasa.',
          'Passwords are used for sign-in and are not stored in your browser by this app.',
          'Some details may be unavailable when they are not provided by a source.',
          'Map tiles and geocoding requests go to OpenStreetMap-based services with attribution.',
          'Browser local storage keeps your shortlist, search state and session token on this device.',
        ].map((item) => (<div key={item} className="surface-muted flex items-start gap-2.5 rounded-xl p-3.5 text-xs leading-relaxed text-ink-600">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden/>
            {item}
          </div>))}
      </div>
    </section>

    <div className="mt-6 space-y-5">
      <PolicySection id="privacy-scope" number={1} title="Scope and status of this draft">
        <p>
          This document describes the current Nivasa build, an India-focused accommodation record discovery service. It
          is a draft for review, not a legal notice from a registered organisation. It does not apply to third-party
          websites, and no named entity is offering a commercial service under it.
        </p>
        <p>
          A reviewed policy should replace this draft before real accounts, payments or messaging are offered at scale.
        </p>
      </PolicySection>

      <PolicySection id="privacy-server" number={2} title="Information handled by the API">
        <PolicyList>
          <li>
            <strong>Account details:</strong> registration sends your name, email address and password to the API. Login
            sends your email address and password for verification. This client stores the returned token and user
            record, not the password.
          </li>
          <li>
            <strong>Contact messages:</strong> the contact form sends your name, email address, subject, optional context
            and message so we can receive your request.
          </li>
          <li>
            <strong>Owner submissions:</strong> property details submitted by owners are reviewed before being published. Fields that are not provided remain “Not available”.
          </li>
          <li>
            <strong>Search requests:</strong> location text is sent to the geocoding proxy to resolve places. Record
            searches use the resolved coordinates and filters rather than collecting a separate profile.
          </li>
        </PolicyList>
        <p>
          We use the information you provide to operate the service, respond to messages, and improve your experience. We do not sell your personal information.
        </p>
      </PolicySection>

      <PolicySection id="privacy-local-storage" number={3} title="Information stored in your browser">
        <p>
          Local storage keeps your shortlist and preferences across refreshes. It stays in the browser profile you are
          using unless you clear it. The keys used are:
        </p>
        <ul className="ml-5 list-disc space-y-2 marker:text-teal-600">
          {LOCAL_KEYS.map((item) => (<li key={item.key}>
              <code className="rounded bg-ink-50 px-1.5 py-0.5 text-[11px] font-semibold text-ink-700">{item.key}</code>{' '}
              — {item.detail}
            </li>))}
        </ul>
        <p>
          Signing out removes the token and cached account from this browser; it does not delete the server record.
          Assistant replies are generated from the current search context and are not stored as a conversation history.
        </p>
      </PolicySection>

      <PolicySection id="privacy-sources" number={4} title="Listing information">
        <p>
          Nivasa shows place and listing information from available sources. Some details, such as rent, availability, photos, or contact information, may not be available for every place. When information is missing, we show it as “Not available”.
        </p>
        <p>
          We aim to present information clearly and avoid showing guessed or fabricated details.
        </p>
      </PolicySection>

      <PolicySection id="privacy-third-party" number={5} title="Third-party resources">
        <p>
          Map discovery requests tiles from OpenStreetMap, and location suggestions/resolution use Photon or Nominatim
          through the backend proxy. Your browser may expose ordinary request information such as an IP address to tile
          providers. Attribution is shown in the interface, and those services have their own practices that this
          draft does not control.
        </p>
        <p>
          The project also links to an external source-code repository in the footer. That link leaves this site and is
          governed by the destination's own terms.
        </p>
      </PolicySection>

      <PolicySection id="privacy-rights" number={6} title="Your choices and data rights">
        <p>You can remove browser-held data at any time:</p>
        <PolicyList>
          <li>Use the clear controls on saved listings, recently viewed and comparison pages.</li>
          <li>Sign out from your profile to remove the local token and cached account.</li>
          <li>Clear site data or local storage for this site in your browser settings.</li>
        </PolicyList>
        <p>
          If you need help with your account or data, you can contact us through the contact page. A reviewed policy should define access, correction, deletion, and response expectations before any commercial launch.
        </p>
      </PolicySection>

      <PolicySection id="privacy-children" number={7} title="Children">
        <p>
          Nivasa is aimed at people making accommodation decisions and is not directed at children. No age verification
          is performed in this build. A clarified age-eligibility rule and any additional safeguards belong in a
          reviewed policy.
        </p>
      </PolicySection>

      <PolicySection id="privacy-changes" number={8} title="Changes to this document">
        <p>
          This text may change as the service evolves. Because server records exist, edits to this draft do not by
          themselves change stored data. Any future live policy should be versioned and communicated before it takes
          effect.
        </p>
      </PolicySection>

      <PolicySection id="privacy-contact" number={9} title="Questions and contact">
        <p>
          Use the <Link className="font-semibold text-teal-700 hover:underline" to="/contact">contact page</Link> to reach us with questions. Please do not send passwords, identity documents, or payment details through the form.
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
