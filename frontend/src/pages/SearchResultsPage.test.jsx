import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchResultsPage } from './SearchResultsPage';

const mockUseListingResults = vi.fn();
vi.mock('@/components/discovery/useListingResults', () => ({
  useListingResults: () => mockUseListingResults(),
}));
vi.mock('@/components/discovery/useSearchUrlSync', () => ({ useSearchUrlSync: () => {} }));
vi.mock('@/components/search/LocationSearchBar', () => ({ LocationSearchBar: () => <div data-testid="location-bar" /> }));
vi.mock('@/components/search/SearchFiltersPanel', () => ({ SearchFiltersPanel: () => <div /> }));
vi.mock('@/components/discovery/ActiveFilterChips', () => ({ ActiveFilterChips: () => <div /> }));

vi.mock('@/store/useSearchStore', () => {
  const state = {
    query: 'Makarba Ahmedabad',
    radiusKm: 5,
    filters: { categories: [], minRent: null, maxRent: null, furnishing: [], gender: [], occupancy: [], amenities: [], availableFrom: null, verifiedOnly: false },
    sort: 'recommended',
    setSort: vi.fn(),
    resetFilters: vi.fn(),
  };
  const useSearchStore = (selector) => selector(state);
  useSearchStore.getState = () => state;
  return { useSearchStore };
});

function renderPage() {
  return render(<MemoryRouter initialEntries={['/search?q=Makarba']}><SearchResultsPage /></MemoryRouter>);
}

describe('SearchResultsPage', () => {
  beforeEach(() => mockUseListingResults.mockReset());

  it('renders categorized sections and hides technical diagnostics for normal users', () => {
    mockUseListingResults.mockReturnValue({
      results: [
        { property: { id: 'r1', recordType: 'rental_listing', isDemo: false, category: 'pg', title: 'Rental', location: { label: 'A', city: 'Ahmedabad' }, prices: { rent: 10000 }, amenities: [], images: [], verification: 'verified', occupancy: 'single', lastUpdated: null }, distanceKm: 1 },
        { property: { id: 'b1', recordType: 'accommodation_business', isDemo: false, category: 'hostel', title: 'Business', location: { label: 'B', city: 'Ahmedabad' }, prices: { rent: null }, amenities: [], images: [], verification: 'unverified', occupancy: null, lastUpdated: null }, distanceKm: 2 },
        { property: { id: 'd1', recordType: 'demo_listing', isDemo: true, category: 'pg', title: 'Demo', location: { label: 'C', city: 'Ahmedabad' }, prices: { rent: 5000 }, amenities: [], images: [], verification: 'demo', occupancy: 'single', lastUpdated: null }, distanceKm: 3 },
      ],
      meta: { reason: null, diagnostics: undefined },
      isLoading: false, isError: false, error: null, refetch: vi.fn(), hasCoordinates: true,
    });
    renderPage();
    expect(screen.getByText('Rental Properties')).toBeInTheDocument();
    expect(screen.getByText('Nearby PGs & Hostels')).toBeInTheDocument();
    expect(screen.getByText('Demo Listings')).toBeInTheDocument();
    expect(screen.queryByText(/Technical diagnostics/i)).not.toBeInTheDocument();
  });

  it('shows no-rental-listings message when only businesses found', () => {
    mockUseListingResults.mockReturnValue({
      results: [{ property: { id: 'b1', recordType: 'accommodation_business', isDemo: false, category: 'hostel', title: 'Business', location: { label: 'B', city: 'Ahmedabad' }, prices: { rent: null }, amenities: [], images: [], verification: 'unverified', occupancy: null, lastUpdated: null }, distanceKm: 2 }],
      meta: { reason: 'no_rental_listings', message: 'No rental listings with pricing evidence were found near this location.' },
      isLoading: false, isError: false, error: null, refetch: vi.fn(), hasCoordinates: true,
    });
    renderPage();
    expect(screen.getByText(/No rental listings with pricing evidence found nearby/i)).toBeInTheDocument();
  });

  it('shows provider unavailable state clearly', () => {
    mockUseListingResults.mockReturnValue({
      results: [], meta: { reason: 'providers_unavailable', message: 'Accommodation providers are currently unavailable. Please try again.' },
      isLoading: false, isError: false, error: null, refetch: vi.fn(), hasCoordinates: true,
    });
    renderPage();
    expect(screen.getByText(/Accommodation search is temporarily unavailable/i)).toBeInTheDocument();
  });
});
