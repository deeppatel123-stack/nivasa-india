import type { SearchResult } from '@/features/search/searchEngine';
import { formatINR } from '@/features/pricing/pricing';

export interface AssistantContext {
  location?: string;
  radiusKm?: number;
  results: SearchResult[];
}

export interface AssistantReply {
  text: string;
  /** IDs of demo listings used to ground the reply. */
  recommendationIds: string[];
  followUps: string[];
  caveats: string[];
}

export interface RentalAssistant {
  readonly mode: 'demo' | 'remote';
  reply(input: string, context: AssistantContext): Promise<AssistantReply>;
}

const CATEGORY_HINTS: Array<[RegExp, string]> = [
  [/\b(pg|paying guest)\b/i, 'pg'],
  [/\b(hostel|dorm)\b/i, 'hostel'],
  [/\b(co-?living|coliving)\b/i, 'co_living'],
  [/\b(flat|apartment|bhk)\b/i, 'flat'],
  [/\b(private room|private)\b/i, 'private_room'],
  [/\b(shared room|sharing)\b/i, 'shared_room'],
];

function parseBudget(input: string): number | null {
  const match = input.match(/(?:under|below|less than|upto|up to|within)\s*₹?\s*([\d,]+)/i);
  if (!match) return null;
  const value = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(value) ? value : null;
}

function parseRadius(input: string): number | null {
  const match = input.match(/(\d+(?:\.\d+)?)\s*km/i);
  return match ? Number(match[1]) : null;
}

/**
 * Deterministic local recommender used ONLY to demonstrate the assistant UX.
 * It does not call any AI service and never invents property information.
 */
export const demoRulesAssistant: RentalAssistant = {
  mode: 'demo',
  async reply(input, context) {
    const budget = parseBudget(input);
    const radius = parseRadius(input);
    const category = CATEGORY_HINTS.find(([pattern]) => pattern.test(input))?.[1];
    const wantsFood = /\bfood|mess|meals\b/i.test(input);
    const wantsWifi = /\bwi-?fi|internet\b/i.test(input);
    const wantsLowDeposit = /lowest|low.*deposit|less deposit/i.test(input);
    const wantsValue = /value for money|best value|worth/i.test(input);

    let candidates = [...context.results];
    if (radius !== null) {
      candidates = candidates.filter((item) => item.distanceKm !== null && item.distanceKm <= radius);
    }
    if (budget !== null) {
      candidates = candidates.filter((item) => item.monthlyExpense <= budget);
    }
    if (category) {
      candidates = candidates.filter((item) => {
        if (category === 'flat') return item.property.category.startsWith('flat_');
        return item.property.category === category;
      });
    }
    if (wantsFood) {
      candidates = candidates.filter((item) => item.property.amenities.includes('food') || item.property.prices.foodIncluded);
    }
    if (wantsWifi) {
      candidates = candidates.filter((item) => item.property.amenities.includes('wifi'));
    }
    if (wantsLowDeposit) {
      candidates = candidates.sort((a, b) => a.property.prices.deposit - b.property.prices.deposit);
    } else if (wantsValue) {
      candidates = candidates.sort((a, b) => a.perPersonMonthly - b.perPersonMonthly || (a.distanceKm ?? 99) - (b.distanceKm ?? 99));
    } else {
      candidates = candidates.sort((a, b) => b.score - a.score);
    }

    const top = candidates.slice(0, 3);
    const locationNote = context.location ? ` near ${context.location}` : '';
    const constraintNotes: string[] = [];
    if (budget !== null) constraintNotes.push(`about ${formatINR(budget)} per month`);
    if (radius !== null) constraintNotes.push(`within ${radius} km`);
    if (category) constraintNotes.push(`in the requested accommodation type`);
    if (wantsFood) constraintNotes.push('with food available');
    if (wantsWifi) constraintNotes.push('with Wi-Fi');

    const text = top.length
      ? `I found ${top.length} illustrative match${top.length === 1 ? '' : 'es'}${locationNote}${
          constraintNotes.length ? ` matching ${constraintNotes.join(', ')}` : ''
        }. I ranked them using distance, total monthly expense and occupancy.`
      : `I could not find a matching illustrative listing${locationNote} with the current filters. Try widening the radius, raising the budget, or choosing another location.`;

    return {
      text,
      recommendationIds: top.map((item) => item.property.id),
      followUps: top.length
        ? ['Compare these options', 'Which one has the lowest deposit?', 'Show only places with food']
        : ['Show all demo listings', 'Increase search radius to 20 km'],
      caveats: [
        'Demo recommendations only — the AI service is not connected in this phase.',
        'Results are illustrative listings, not real properties or market quotes.',
      ],
    };
  },
};
