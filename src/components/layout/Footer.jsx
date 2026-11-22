import { Link } from 'react-router-dom';
import { Github, MapPin } from 'lucide-react';
import { Logo } from './Navbar';
const COLUMNS = [
    {
        title: 'Discover',
        links: [
            { to: '/explore', label: 'Explore stays' },
            { to: '/map', label: 'Map discovery' },
            { to: '/compare', label: 'Compare prices' },
            { to: '/assistant', label: 'AI assistant' },
            { to: '/recently-viewed', label: 'Recently viewed' },
        ],
    },
    {
        title: 'For owners',
        links: [
            { to: '/owner/dashboard', label: 'Owner dashboard' },
            { to: '/owner/add-property', label: 'Add a property' },
            { to: '/owner/listings', label: 'Manage listings' },
        ],
    },
    {
        title: 'Company',
        links: [
            { to: '/about', label: 'About Nivasa' },
            { to: '/contact', label: 'Contact us' },
            { to: '/faq', label: 'FAQ' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { to: '/privacy', label: 'Privacy policy' },
            { to: '/terms', label: 'Terms & conditions' },
        ],
    },
];
export function Footer() {
    return (<footer className="mt-20 border-t border-ink-800 bg-ink-950 text-white">
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.4fr_2.6fr]">
        <div>
          <Logo light/>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
            A discovery platform for India's students and working professionals — built to make accommodation
            decisions clearer, fairer and better informed.
          </p>
          <div className="mt-5 flex items-center gap-2 text-[11px] text-white/50">
            <MapPin className="h-3.5 w-3.5" aria-hidden/> Built for India, from Ahmedabad to everywhere.
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {COLUMNS.map((column) => (<div key={column.title}>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-white/80">{column.title}</h2>
              <ul className="space-y-2">
                {column.links.map((link) => (<li key={link.to}>
                    <Link to={link.to} className="text-xs text-white/50 transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>))}
              </ul>
            </div>))}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="shell flex flex-col gap-3 py-5 text-[11px] text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Nivasa. Frontend demonstration build.</p>
          <p className="flex items-center gap-2">
            No real listings, contacts or prices are displayed.{' '}
            <a href="https://github.com/deeppatel123-stack/nivasa-india" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-white/60 hover:text-white">
              <Github className="h-3.5 w-3.5"/> Source
            </a>
          </p>
        </div>
      </div>
    </footer>);
}
