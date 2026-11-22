import type { ImageAsset } from './types';

/**
 * Royalty-free, generic interior photography used only to demonstrate layout.
 * Every asset is flagged illustrative and credited in the UI. These photos are
 * NOT images of any advertised accommodation.
 */
function illustrative(url: string, alt: string): ImageAsset {
  return {
    url,
    alt,
    credit: 'Illustrative stock photo via Unsplash — not a photo of the listed property',
    isIllustrative: true,
  };
}

export const DEMO_IMAGES: ImageAsset[] = [
  illustrative('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', 'Bright furnished living room'),
  illustrative('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', 'Modern interior with natural light'),
  illustrative('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', 'Living area with seating'),
  illustrative('https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80', 'Comfortable sofa and decor'),
  illustrative('https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1200&q=80', 'Neutral-toned bedroom interior'),
  illustrative('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80', 'Contemporary apartment interior'),
  illustrative('https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80', 'Kitchen and dining space'),
  illustrative('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', 'Spacious modern room'),
  illustrative('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80', 'Cosy apartment interior'),
  illustrative('https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80', 'Bedroom with work desk'),
  illustrative('https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80', 'Bedroom with soft lighting'),
  illustrative('https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80', 'Hotel-style room interior'),
  illustrative('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'Residential building exterior'),
  illustrative('https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80', 'Modern home exterior'),
  illustrative('https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', 'Neat bedroom interior'),
];

export function demoImageSet(start: number, count = 3): typeof DEMO_IMAGES {
  return Array.from({ length: count }, (_, i) => DEMO_IMAGES[(start + i) % DEMO_IMAGES.length]);
}
