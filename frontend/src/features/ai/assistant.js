import { formatINR } from '@/features/pricing/pricing';

const CATEGORY_HINTS = [
  [/\b(pg|paying guest)\b/i, 'pg'],
  [/\b(hostel|dorm)\b/i, 'hostel'],
  [/\b(co-?living|coliving)\b/i, 'co_living'],
  [/\b(flat|apartment|bhk)\b/i, 'flat'],
  [/\b(private room|private)\b/i, 'private_room'],
  [/\b(shared room|sharing)\b/i, 'shared_room'],
];

function parseBudget(input) {
  const match = input.match(/(?:under|below|less than|upto|up to|within)\s*₹?\s*([\d,]+)/i);
  if (!match) return null;
  const value = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(value) && value > 0 ? value : null;
}

function parseRadius(input) {
  const match = input.match(/(\d+(?:\.\d+)?)\s*km/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 && value <= 50 ? value : null;
}

/**
 * Deterministic local recommender. Every recommendation comes from the genuine
 * records already returned by the search API. It never invents a property,
 * price, contact or review, and it never claims to call an AI model.
 */
export const groundedAssistant = {
  mode: 'local-rules',
  async reply(input, context) {
    const budget = parseBudget(input);
    const radius = parseRadius(input);
    const category = CATEGORY_HINTS.find(([pattern]) => pattern.test(input))?.[1];
    const wantsFood = /\bfood|mess|meals\b/i.test(input);
    const wantsWifi = /\bwi-?fi|internet\b/i.test(input);
    const wantsLowDeposit = /lowest|low.*deposit|less deposit/i.test(input);

    let candidates = [...context.results];
    const applied = [];
    if (radius !== null) {
      candidates = candidates.filter((item) => item.distanceKm !== null && item.distanceKm <= radius);
      applied.push(`within ${radius} km`);
    }
    if (budget !== null) {
      // Records without a supplied rent cannot be claimed to fit a budget.
      candidates = candidates.filter((item) => item.monthlyExpense !== null && item.monthlyExpense <= budget);
      applied.push(`under ${formatINR(budget)}/month`);
    }
    if (category) {
      candidates = candidates.filter((item) =>
        category === 'flat' ? item.property.category.startsWith('flat_') : item.property.category === category,
      );
      applied.push('requested accommodation type');
    }
    if (wantsFood) {
      candidates = candidates.filter(
        (item) => item.property.amenities.includes('food') || item.property.prices.foodIncluded,
      );
      applied.push('food information available');
    }
    if (wantsWifi) {
      candidates = candidates.filter((item) => item.property.amenities.includes('wifi'));
      applied.push('Wi-Fi information available');
    }

    if (wantsLowDeposit) {
      candidates.sort(
        (a, b) => (a.property.prices.deposit ?? Infinity) - (b.property.prices.deposit ?? Infinity),
      );
    } else {
      candidates.sort(
        (a, b) =>
          b.score - a.score ||
          (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity),
      );
    }

    const top = candidates.slice(0, 3);
    const locationNote = context.location ? ` in the results near ${context.location}` : ' in the current search results';
    const constraintNote = applied.length ? ` applying ${applied.join(', ')}` : '';
    const text = top.length
      ? `I found ${top.length} matching genuine ${top.length === 1 ? 'record' : 'records'}${locationNote}${constraintNote}. I ranked them by proximity and data completeness, then by the criterion in your question. I only used records returned by your search.`
      : `I could not find a matching genuine record${locationNote}${constraintNote}. The current results may not include prices or amenities, or none fall inside the requested radius. Try another location or widen your search.`;

    return {
      text,
      recommendationIds: top.map((item) => item.property.id),
      followUps: top.length
        ? ['Compare these options', 'Which one has the lowest deposit?']
        : ['Search a nearby location'],
      caveats: [
        'Grounded in the genuine records returned by your current search; no AI service is connected.',
        'Rent, availability and contact details are shown only when a source supplied them.',
      ],
    };
  },
};

export const groundedRulesAssistant = groundedAssistant;
