import { Link } from 'react-router-dom';
import { DraftPolicyBanner, PolicyFooterNav, PolicyList, PolicySection } from '@/components/content/PolicyDocument';
import { PageShell } from '@/components/layout/PageShell';
import { Badge } from '@/components/ui/Badge';

export function TermsPage() {
  return (
    <PageShell
      eyebrow="Draft policy · frontend demo"
      title="Terms of use (draft)"
      description="The ground rules for exploring this demonstration — written as a draft, not as a binding legal agreement."
      breadcrumbs={[{ label: 'Terms of use' }]}
      actions={<Badge tone="amber">DRAFT — not a published agreement</Badge>}
    >
      <DraftPolicyBanner title="Draft terms of use for the Nivasa frontend demo" />

      <section className="card mt-6 p-5 sm:p-6" aria-labelledby="terms-at-a-glance">
        <h2 id="terms-at-a-glance" className="font-display text-lg font-bold text-ink-950">
          The short version
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            'This is a frontend demonstration, not a rental, booking or brokerage service.',
            'All listings, prices, availability and verification labels are illustrative.',
            'Nothing you submit through a form is sent, published or stored on a server.',
            'Owner and account screens are previews; they create no listings or real accounts.',
            'Use the demo for evaluation and learning, not for real accommodation decisions.',
            'These terms are a draft and will need review before any production launch.',
          ].map((item) => (
            <div key={item} className="surface-muted flex items-start gap-2.5 rounded-xl p-3.5 text-xs leading-relaxed text-ink-600">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" aria-hidden />
              {item}
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 space-y-5">
        <PolicySection id="terms-scope" number={1} title="Draft status and scope">
          <p>
            These terms are a working draft for a frontend demonstration of Nivasa, an India-focused accommodation
            discovery concept. They are not a contract, have not been legally reviewed, and do not create rights or
            obligations for any party. No named legal entity is offering a service under them.
          </p>
          <p>
            The terms apply only to this demonstration. External sites reached through links in the interface are
            governed by their own terms.
          </p>
        </PolicySection>

        <PolicySection id="terms-demo" number={2} title="Demonstration content is not an offer">
          <p>
            Every property shown here is flagged as demonstration data. Titles, descriptions, imagery credits, prices,
            availability dates, source labels and verification states are illustrative. They are not real listings,
            market quotes, offers to rent, confirmations of availability or professional advice.
          </p>
          <p>
            The platform does not act as a broker, landlord, tenant, agent or payment processor in this build. No
            booking, reservation, tenancy or financial transaction can be made through the demo. Do not rely on any
            sample figure to budget for a real move.
          </p>
        </PolicySection>

        <PolicySection id="terms-use" number={3} title="Permitted use">
          <p>You may use this demonstration to explore the interface, evaluate the product idea and learn from the implementation.</p>
          <PolicyList>
            <li>Do not use it for unlawful purposes, harassment, fraud or misleading anyone about its demo status.</li>
            <li>Do not attempt to disrupt the interface, overwhelm it with automated requests or bypass its client-side behaviour.</li>
            <li>Do not scrape, republish or present sample data as real accommodation inventory.</li>
            <li>Do not enter real secrets, financial details, identity documents or other people's personal information into demo forms.</li>
            <li>Respect the terms of third-party resources such as map tile providers when using those features.</li>
          </PolicyList>
        </PolicySection>

        <PolicySection id="terms-accounts" number={4} title="Accounts, owners and assistant features">
          <p>
            Sign-in and sign-up screens create a local preview profile in your browser only. No credentials are
            verified, no real account is registered, no password is stored and the Google sign-in control is a visual
            placeholder. Password reset does not send an email.
          </p>
          <p>
            Owner dashboard, add-property and listing-management pages are interface previews. They do not publish a
            listing, store it on a server, notify a prospective tenant or generate leads. The AI assistant uses local
            rules over the current demo results; it is not a connected AI service and does not make factual claims about
            real places.
          </p>
        </PolicySection>

        <PolicySection id="terms-submissions" number={5} title="Form submissions and your content">
          <p>
            The contact form validates input in the browser and then displays a notification stating that nothing was
            sent. There is no inbox, server or ticket system behind it. Text you type is not published or retained by
            the application. Because of this, the demo cannot provide support, acknowledge legal notices or accept
            service of any document.
          </p>
          <p>
            Any notes you make while using the demo remain in your browser as described in the{' '}
            <Link className="font-semibold text-teal-700 hover:underline" to="/privacy">draft privacy policy</Link>. You are responsible for
            what you choose to enter; avoid submitting information you would not want exposed in a browser profile.
          </p>
        </PolicySection>

        <PolicySection id="terms-third-party" number={6} title="Third-party resources">
          <p>
            Map discovery loads tiles and attribution from OpenStreetMap, and the footer links to an external
            source-code repository. These resources are not controlled by this demo, and their availability and terms
            are independent. No endorsement of a third party is implied by a link or by map content.
          </p>
        </PolicySection>

        <PolicySection id="terms-warranties" number={7} title="No warranties">
          <p>
            The demonstration is provided “as is”. No warranty is given that sample data is accurate, current or
            complete, that the interface will always be available, or that any estimate of cost or distance reflects a
            real property or a real commute. Filters, scores, comparisons and assistant replies are illustrative
            mechanics, not guarantees.
          </p>
        </PolicySection>

        <PolicySection id="terms-liability" number={8} title="Limitation of responsibility">
          <p>
            To the extent permitted by applicable law, no responsibility is accepted for decisions made on the basis
            of demonstration data, for losses arising from reliance on sample prices or availability, or for the
            availability of third-party map resources. Nothing in this draft excludes responsibility where it cannot
            lawfully be excluded; a reviewed document would define this properly for any real service.
          </p>
        </PolicySection>

        <PolicySection id="terms-future" number={9} title="Future versions">
          <p>
            If the concept becomes a live service, these terms and the privacy draft would need to be replaced with
            reviewed versions before real accounts, listings, messages or payments are introduced. Continued use of a
            future service would then be governed by the terms published at that time.
          </p>
        </PolicySection>

        <PolicySection id="terms-law" number={10} title="Governing law and disputes">
          <p>
            No governing-law or jurisdiction clause is asserted in this draft because no real service or legal entity
            is operating here. Such a clause, along with a fair dispute process, would need to be specified in reviewed
            terms before launch.
          </p>
        </PolicySection>

        <PolicySection id="terms-contact" number={11} title="Questions and notices">
          <p>
            The <Link className="font-semibold text-teal-700 hover:underline" to="/contact">contact page</Link> has no connected channels in
            this phase, so questions and formal notices cannot be received through it. This draft is a starting point
            for review, not legal advice and not a substitute for a published agreement.
          </p>
        </PolicySection>
      </div>

      <PolicyFooterNav current="terms" />
    </PageShell>
  );
}
