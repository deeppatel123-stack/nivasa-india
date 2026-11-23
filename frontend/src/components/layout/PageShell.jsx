import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { DataQualityNotice } from '@/components/common/DataQualityNotice';
import { cn } from '@/lib/utils';
export function PageShell({ title, description, eyebrow, breadcrumbs, actions, showDataNote = false, children, className, }) {
    return (<div className={cn('min-h-[60vh]', className)}>
      <div className="border-b border-ink-100 bg-white">
        <div className="shell py-8 sm:py-10">
          {breadcrumbs && (<nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-[11px] text-ink-400">
              <Link to="/" className="hover:text-ink-700">
                Home
              </Link>
              {breadcrumbs.map((crumb) => (<span key={crumb.label} className="inline-flex items-center gap-1">
                  <ChevronRight className="h-3 w-3" aria-hidden/>
                  {crumb.to ? (<Link to={crumb.to} className="hover:text-ink-700">
                      {crumb.label}
                    </Link>) : (<span className="font-medium text-ink-600">{crumb.label}</span>)}
                </span>))}
            </nav>)}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{eyebrow}</p>}
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">{title}</h1>
              {description && <p className="mt-2 text-sm leading-relaxed text-ink-500">{description}</p>}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
          </div>
        </div>
      </div>
      <div className="shell py-7 sm:py-9">
        {showDataNote && <DataQualityNotice className="mb-6"/>}
        {children}
      </div>
    </div>);
}
