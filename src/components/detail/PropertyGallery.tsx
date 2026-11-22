import { useState } from 'react';
import { ChevronLeft, ChevronRight, Images } from 'lucide-react';
import type { Property } from '@/features/listings/types';
import { cn } from '@/lib/utils';

/**
 * Gallery for illustrative demo imagery. Every asset is labelled as stock
 * photography so it can never be mistaken for a photo of a real listing.
 */
export function PropertyGallery({ property }: { property: Property }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(() => new Set<string>());
  const images = property.images;
  const active = images[activeIndex];

  const markFailed = (url: string) => {
    setFailedUrls((current) => {
      if (current.has(url)) return current;
      return new Set(current).add(url);
    });
  };

  const move = (direction: -1 | 1) => {
    if (images.length < 2) return;
    setActiveIndex((current) => (current + direction + images.length) % images.length);
  };

  if (!images.length || !active) {
    return (
      <div className="grid h-64 place-items-center bg-ink-100 text-ink-400 sm:h-96">
        <div className="text-center">
          <Images className="mx-auto h-8 w-8" aria-hidden />
          <p className="mt-2 text-xs">Illustrative images unavailable</p>
        </div>
      </div>
    );
  }

  const activeFailed = failedUrls.has(active.url);

  return (
    <figure>
      <div className="relative h-64 bg-ink-100 sm:h-96">
        {activeFailed ? (
          <div className="grid h-full w-full place-items-center text-ink-400">
            <div className="text-center">
              <Images className="mx-auto h-8 w-8" aria-hidden />
              <p className="mt-2 text-xs">Illustrative image unavailable</p>
            </div>
          </div>
        ) : (
          <img
            src={active.url}
            alt={active.alt}
            onError={() => markFailed(active.url)}
            className="h-full w-full object-cover"
          />
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous illustrative image"
              className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-ink-800 shadow-soft transition hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next illustrative image"
              className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-ink-800 shadow-soft transition hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/80 to-transparent px-4 pb-3 pt-10">
          <p className="text-[11px] font-semibold text-white">
            Illustrative stock photo — not a photo of this property
          </p>
        </div>
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto bg-white p-3" role="group" aria-label="Illustrative image thumbnails">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-pressed={index === activeIndex}
              aria-label={`Show illustrative image ${index + 1}: ${image.alt}`}
              className={cn(
                'h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 bg-ink-100 transition',
                index === activeIndex ? 'border-teal-600' : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              {failedUrls.has(image.url) ? (
                <span className="grid h-full w-full place-items-center text-ink-400">
                  <Images className="h-4 w-4" aria-hidden />
                </span>
              ) : (
                <img
                  src={image.url}
                  alt=""
                  loading="lazy"
                  onError={() => markFailed(image.url)}
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}

      <figcaption className="border-t border-ink-100 px-4 py-2.5 text-[11px] leading-relaxed text-ink-500">
        {active.credit}. This demo listing is not a real property.
      </figcaption>
    </figure>
  );
}
