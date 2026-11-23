import { useState } from 'react';
import { ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { cn } from '@/lib/utils';
/** Displays images exactly as supplied by the listing source. */
export function PropertyGallery({ property }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [failedUrls, setFailedUrls] = useState(() => new Set());
    const images = Array.isArray(property?.images) ? property.images : [];
    const active = images[activeIndex] ?? images[0];
    const markFailed = (url) => {
        setFailedUrls((current) => {
            if (current.has(url))
                return current;
            return new Set(current).add(url);
        });
    };
    const move = (direction) => {
        if (images.length < 2)
            return;
        setActiveIndex((current) => {
            const index = current >= images.length ? 0 : current;
            return (index + direction + images.length) % images.length;
        });
    };
    if (!images.length || !active) {
        return (<div className="grid h-64 place-items-center bg-ink-100 text-ink-400 sm:h-96" role="img" aria-label="Photo not available">
          <div className="text-center">
            <Images className="mx-auto h-8 w-8" aria-hidden/>
            <p className="mt-2 text-xs">Photo not available</p>
          </div>
        </div>);
    }
    const activeFailed = failedUrls.has(active.url);
    return (<figure>
      <div className="relative h-64 bg-ink-100 sm:h-96">
        {activeFailed ? (<div className="grid h-full w-full place-items-center text-ink-400" role="img" aria-label="Photo not available">
            <div className="text-center">
              <Images className="mx-auto h-8 w-8" aria-hidden/>
              <p className="mt-2 text-xs">Photo not available</p>
            </div>
          </div>) : (<img src={active.url} alt={active.alt || 'Property photo supplied by the listing source'} onError={() => markFailed(active.url)} className="h-full w-full object-cover"/>)}

        {images.length > 1 && (<>
            <button type="button" onClick={() => move(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-ink-800 shadow-soft transition hover:bg-white">
              <ChevronLeft className="h-4 w-4" aria-hidden/>
            </button>
            <button type="button" onClick={() => move(1)} aria-label="Next photo" className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-ink-800 shadow-soft transition hover:bg-white">
              <ChevronRight className="h-4 w-4" aria-hidden/>
            </button>
          </>)}
      </div>

      {images.length > 1 && (<div className="no-scrollbar flex gap-2 overflow-x-auto bg-white p-3" role="group" aria-label="Property photo thumbnails">
          {images.map((image, index) => (<button key={`${image.url}-${index}`} type="button" onClick={() => setActiveIndex(index)} aria-pressed={index === activeIndex} aria-label={`Show photo ${index + 1}${image.alt ? `: ${image.alt}` : ''}`} className={cn('h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 bg-ink-100 transition', index === activeIndex ? 'border-teal-600' : 'border-transparent opacity-70 hover:opacity-100')}>
              {failedUrls.has(image.url) ? (<span className="grid h-full w-full place-items-center text-ink-400" aria-hidden>
                  <Images className="h-4 w-4"/>
                </span>) : (<img src={image.url} alt="" loading="lazy" onError={() => markFailed(image.url)} className="h-full w-full object-cover"/>)}
            </button>))}
        </div>)}

      {active.credit && (<figcaption className="border-t border-ink-100 px-4 py-2.5 text-[11px] leading-relaxed text-ink-500">
        Photo credit: {active.credit}
      </figcaption>)}
    </figure>);
}
