import { Link } from 'react-router-dom';
import { DraftPolicyBanner, PolicyFooterNav, PolicyList, PolicySection } from '@/components/content/PolicyDocument';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';

export function TermsPage() {
  return (<PageShell eyebrow="Draft policy" title="Terms of use (draft)" description="Draft ground rules for using Nivasa's record search, accounts and message submission." breadcrumbs={[{ label: 'Terms of use' }]} actions={<Badge tone="amber">DRAFT — not a published agreement</Badge>}>
    <DraftPolicyBanner title="Draft terms of use for Nivasa"/>

    <section className="card mt-6 p-5 sm:p-6" aria-labelledby="terms-at-a-glance">
      <h2 id="terms-at-a-glance" className="font-display text-lg font-bold text-ink-950">The short version</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[
          'Nivasa is an accommodation record discovery tool, not a rental, booking or brokerage service.',
          'Records come from OpenStreetMap and attributed submissions; missing details read “Not available”.',
          'Accounts and contact messages are stored by the API in MongoDB or a local development file.',
          'No listing portal is scraped and no paid data is purchased.',
          'No partner APIs, Google Places key or email delivery are connected.',
          'These terms are a draft and need review before any commercial launch.',
        ].map((item) => (<div key={item} className="surface-muted flex items-start gap-2.5 rounded-xl p-3.5 text-xs leading-relaxed text-ink-600">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden/>
            {item}
          </div>))}
      </div>
    </section>

    <div className="mt-6 space-y-5">
      <PolicySection id="terms-scope" number={1} title="Draft status and scope">
        <p>
          These terms are a working draft for the current Nivasa build. They are not a contract, have not been legally
          reviewed, and do not create rights or obligations for any party. No named legal entity operates a commercial
          service under them.
        </p>
        <p>
          They apply to this site only. External sites reached through links in the interface are governed by their own
          terms.
        </p>
      </PolicySection>

      <PolicySection id="terms-records" number={2} title="Records are information, not offers">
        <p>
          Accommodation places shown here come from OpenStreetMap and from submitted records with source attribution.
          OpenStreetMap place data does not establish rent, room inventory, availability, owner identity or contact
          details; those fields are shown as “Not available” rather than inferred. Submissions remain unverified and
          pending moderation until evidence supports another state.
        </p>
        <p>
          Nivasa does not act as broker, landlord, tenant, agent or payment processor in this build. No booking,
          reservation, tenancy or financial transaction is completed here. Do not treat a record as a quote or a
          confirmation that a place can be rented.
        </p>
      </PolicySection>

      <PolicySection id="terms-use" number={3} title="Permitted use">
        <p>Use the service to search, compare and shortlist accommodation records.</p>
        <PolicyList>
          <li>Do not use it for unlawful purposes, harassment, fraud or misrepresenting a record's status.</li>
          <li>Do not overwhelm the API, bypass its validation or interfere with other users.</li>
          <li>Do not scrape this service or third-party listing sites, and do not bypass access controls or robots policies.</li>
          <li>Do not republish records as verified availability or present missing fields as known values.</li>
          <li>Do not enter real secrets, financial details, identity documents or other people's personal information into forms.</li>
          <li>Respect the terms of OpenStreetMap, Photon, Nominatim and tile providers when using location features.</li>
        </PolicyList>
      </PolicySection>

      <PolicySection id="terms-accounts" number={4} title="Accounts and assistant features">
        <p>
          Registration and login are handled by the API. Credentials are sent to the server; this client stores the
          returned token and cached user record, not the password. Password reset delivery is not configured, and the
          reset page reports that status rather than claiming an email was sent. No Google sign-in control is offered.
        </p>
        <p>
          The assistant uses local rules over the records you can already see. It does not call an external AI service,
          confirm availability or make factual claims about a real place. Owner submissions are stored with provenance
          and a pending moderation state.
        </p>
      </PolicySection>

      <PolicySection id="terms-submissions" number={5} title="Form submissions and your content">
        <p>
          The contact form validates input in the browser and then posts it to the API. The response includes the stored
          record id and the persistence mode — MongoDB when configured, otherwise a local development file. No email
          notification is generated, and no support email or phone number is published here.
        </p>
        <p>
          You remain responsible for what you submit. Browser-held shortlists and session data are described in the{' '}
          <Link className="font-semibold text-teal-700 hover:underline" to="/privacy">draft privacy policy</Link>. Avoid entering information you would not
          want stored in a server record or browser profile.
        </p>
      </PolicySection>

      <PolicySection id="terms-sources" number={6} title="Data sources and persistence">
        <p>
          Records are sourced from OpenStreetMap and explicit submissions. No portal scraping occurs, no partner APIs
          are connected, no billing-enabled Google Places key is configured, and no paid data feeds are used. Server
          records and messages persist in MongoDB or a local development file, with source fields shown in the
          interface where provided.
        </p>
      </PolicySection>

      <PolicySection id="terms-third-party" number={7} title="Third-party resources">
        <p>
          Map tiles come from OpenStreetMap, and place suggestions/resolution use OpenStreetMap-based geocoders through
          the backend proxy. The footer links to an external source-code repository. These resources are not controlled
          by Nivasa, and no endorsement is implied by a link or by map content.
        </p>
      </PolicySection>

      <PolicySection id="terms-warranties" number={8} title="No warranties">
        <p>
          The service is provided “as is”. OpenStreetMap-derived records can be incomplete, stale or incorrect, and
          missing values are deliberately shown as “Not available”. Distances, cost breakdowns, comparison views and
          assistant replies are decision aids, not guarantees about a place, a commute or a price.
        </p>
      </PolicySection>

      <PolicySection id="terms-liability" number={9} title="Limitation of responsibility">
        <p>
          To the extent permitted by applicable law, no responsibility is accepted for decisions made from incomplete
          records or for the availability of third-party map resources. Reviewed terms for any commercial service
          should define responsibility properly; nothing in this draft excludes responsibility where it cannot lawfully
          be excluded.
        </p>
      </PolicySection>

      <PolicySection id="terms-future" number={10} title="Future versions">
        <p>
          If paid feeds, messaging or other commercial features are introduced, these terms and the privacy draft must
          be replaced with reviewed versions before those features are offered. Continued use of a future service would
          then be governed by the terms published at that time.
        </p>
      </PolicySection>

      <PolicySection id="terms-law" number={11} title="Governing law and disputes">
        <p>
          No governing-law or jurisdiction clause is asserted in this draft because no legal entity is named here. A
          reviewed document would specify a fair dispute process before any commercial launch.
        </p>
      </PolicySection>

      <PolicySection id="terms-contact" number={12} title="Questions and notices">
        <p>
          The <Link className="font-semibold text-teal-700 hover:underline" to="/contact">contact page</Link> stores a
          message and returns a reference id, but email delivery is not configured. This draft is a starting point for
          review, not legal advice and not a substitute for a published agreement.
        </p>
      </PolicySection>
    </div>

    <PolicyFooterNav current="terms"/>
  </PageShell>);
}
