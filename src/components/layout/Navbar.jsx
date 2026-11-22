import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Heart, LogOut, Menu, Sparkles, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useSavedStore } from '@/store/useSavedStore';
const NAV_LINKS = [
    { to: '/explore', label: 'Explore' },
    { to: '/map', label: 'Map search' },
    { to: '/compare', label: 'Compare' },
    { to: '/assistant', label: 'AI assistant' },
];
export function Logo({ light = false }) {
    return (<Link to="/" className="group inline-flex items-center gap-2.5" aria-label="Nivasa home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-900 text-white shadow-soft transition group-hover:bg-teal-700">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
          <path d="M3.5 10.8 12 4l8.5 6.8v8.2a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
          <path d="M9.5 20v-6h5v6" stroke="#f97316" strokeWidth="1.8" strokeLinejoin="round"/>
        </svg>
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight">
        <span className={light ? 'text-white' : 'text-ink-950'}>nivasa</span>
        <span className="text-saffron-500">.</span>
      </span>
    </Link>);
}
export function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuthStore();
    const savedCount = useSavedStore((state) => state.ids.length);
    useEffect(() => {
        setMenuOpen(false);
        setAccountOpen(false);
    }, [pathname]);
    return (<header className="sticky top-0 z-[800] border-b border-ink-100 bg-white/90 backdrop-blur-xl">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {NAV_LINKS.map((link) => (<NavLink key={link.to} to={link.to} className={({ isActive }) => cn('rounded-lg px-3 py-2 text-sm font-semibold transition', isActive ? 'bg-ink-50 text-ink-950' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-900')}>
              {link.label}
            </NavLink>))}
          <NavLink to="/owner/dashboard" className={({ isActive }) => cn('rounded-lg px-3 py-2 text-sm font-semibold transition', isActive ? 'bg-ink-50 text-ink-950' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-900')}>
            For owners
          </NavLink>
        </nav>

        <div className="flex items-center gap-1.5">
          <Link to="/wishlist" aria-label={`Saved properties: ${savedCount}`} className="relative grid h-9 w-9 place-items-center rounded-xl text-ink-600 transition hover:bg-ink-50 hover:text-ink-950">
            <Heart className="h-[18px] w-[18px]"/>
            {savedCount > 0 && (<span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-saffron-500 px-1 text-[9px] font-bold text-ink-950">
                {savedCount}
              </span>)}
          </Link>

          {user ? (<div className="relative hidden sm:block">
              <button type="button" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen} className="flex items-center gap-2 rounded-xl border border-ink-100 bg-white px-2.5 py-1.5 text-sm font-semibold text-ink-800 transition hover:border-ink-200">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-teal-100 text-teal-800">
                  <UserRound className="h-3.5 w-3.5"/>
                </span>
                <span className="max-w-[90px] truncate">{user.name}</span>
                <ChevronDown className="h-3.5 w-3.5 text-ink-400"/>
              </button>
              {accountOpen && (<div className="absolute right-0 top-[calc(100%+8px)] z-50 w-48 rounded-xl border border-ink-100 bg-white p-1.5 shadow-lift">
                  <Link to="/profile" className="block rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50">
                    My profile
                  </Link>
                  <Link to="/wishlist" className="block rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-ink-50">
                    Shortlist
                  </Link>
                  <button type="button" onClick={() => {
                    signOut();
                    navigate('/');
                }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-700 hover:bg-ink-50">
                    <LogOut className="h-3.5 w-3.5"/> Sign out
                  </button>
                </div>)}
            </div>) : (<div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="rounded-xl px-3 py-2 text-sm font-semibold text-ink-600 transition hover:text-ink-950">
                Log in
              </Link>
              <Button size="sm" onClick={() => navigate('/register')} rightIcon={<Sparkles className="h-3.5 w-3.5"/>}>
                Get started
              </Button>
            </div>)}

          <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} className="grid h-9 w-9 place-items-center rounded-xl text-ink-700 transition hover:bg-ink-50 lg:hidden">
            {menuOpen ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
          </button>
        </div>
      </div>

      {menuOpen && (<nav className="border-t border-ink-100 bg-white px-4 py-3 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-[1240px] gap-1">
            {[...NAV_LINKS, { to: '/owner/dashboard', label: 'Owner dashboard' }, { to: '/explore', label: 'Browse all stays' }].map((link) => (<NavLink key={link.to + link.label} to={link.to} className={({ isActive }) => cn('rounded-lg px-3 py-2.5 text-sm font-semibold', isActive ? 'bg-ink-50 text-ink-950' : 'text-ink-600')}>
                {link.label}
              </NavLink>))}
            <div className="mt-2 flex gap-2 border-t border-ink-100 pt-3">
              {user ? (<Button variant="outline" size="sm" fullWidth onClick={() => navigate('/profile')}>
                  My profile
                </Button>) : (<>
                  <Button variant="outline" size="sm" fullWidth onClick={() => navigate('/login')}>
                    Log in
                  </Button>
                  <Button size="sm" fullWidth onClick={() => navigate('/register')}>
                    Sign up
                  </Button>
                </>)}
            </div>
          </div>
        </nav>)}
    </header>);
}
