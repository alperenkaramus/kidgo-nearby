import { describe, it, expect, beforeEach, vi } from 'node:test';
import { searchPlaces, COUNTRIES, DEFAULT_LANGUAGE, DEFAULT_COUNTRY } from '../src/lib/places.js';

// Mock the geodata functions
vi.mock('../src/lib/geodata/places.js', () => ({
  searchFamilyPlaces: vi.fn(),
}));

vi.mock('../src/lib/nearbyOsm.js', () => ({
  fetchNearbyOsmPlaces: vi.fn(),
}));

vi.mock('../src/lib/googlePlaces.js', () => ({
  enrichUiPlacesWithGoogle: vi.fn((places) => places),
}));

vi.mock('../src/lib/geodata/geo.js', () => ({
  distanceMeters: vi.fn(() => 1000),
}));

describe('places library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchPlaces', () => {
    it('should return empty array when no places found', async () => {
      // Mock dependencies to return empty results
      const { fetchNearbyOsmPlaces } = await import('../src/lib/nearbyOsm.js');
      const { searchFamilyPlaces } = await import('../src/lib/geodata/places.js');
      const { enrichUiPlacesWithGoogle } = await import('../src/lib/googlePlaces.js');
      
      fetchNearbyOsmPlaces.mockResolvedValue([]);
      searchFamilyPlaces.mockResolvedValue([]);
      enrichUiPlacesWithGoogle.mockImplementation((places) => places);

      const result = await searchPlaces({
        location: 'NonExistentCity',
        coords: null,
        age: '4',
        category: 'all',
        radiusKm: 5,
        intent: 'quick'
      });

      expect(result).toEqual([]);
      expect(fetchNearbyOsmPlaces).toHaveBeenCalled();
      expect(searchFamilyPlaces).toHaveBeenCalled();
      expect(enrichUiPlacesWithGoogle).toHaveBeenCalledWith([]);
    });

    it('should use OSM places when coordinates are provided', async () => {
      const mockCoords = { lat: 41.0082, lon: 28.9784 };
      const mockOsmPlaces = [
        { id: '1', name: 'Test Park', lat: 41.0, lon: 29.0, category: 'park', familyScore: 80 }
      ];
      
      const { fetchNearbyOsmPlaces } = await import('../src/lib/nearbyOsm.js');
      const { searchFamilyPlaces } = await import('../src/lib/geodata/places.js');
      const { enrichUiPlacesWithGoogle } = await import('../src/lib/googlePlaces.js');
      
      fetchNearbyOsmPlaces.mockResolvedValue(mockOsmPlaces);
      searchFamilyPlaces.mockResolvedValue([]);
      enrichUiPlacesWithGoogle.mockImplementation((places) => places);

      const result = await searchPlaces({
        location: 'Istanbul',
        coords: mockCoords,
        age: '4',
        category: 'park',
        radiusKm: 5,
        intent: 'quick'
      });

      expect(fetchNearbyOsmPlaces).toHaveBeenCalledWith({
        coords: mockCoords,
        city: 'Istanbul',
        age: '4',
        intent: 'quick',
        category: 'park',
        radiusKm: 5
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it('should fallback to seed data when no OSM places found', async () => {
      const mockCoords = { lat: 41.0082, lon: 28.9784 };
      const mockSeedPlaces = [
        { id: '2', name: 'Seed Park', lat: 41.0, lon: 29.0, category: 'park', score: 75 }
      ];
      
      const { fetchNearbyOsmPlaces } = await import('../src/lib/nearbyOsm.js');
      const { searchFamilyPlaces } = await import('../src/lib/geodata/places.js');
      const { enrichUiPlacesWithGoogle } = await import('../src/lib/googlePlaces.js');
      
      fetchNearbyOsmPlaces.mockResolvedValue([]);
      searchFamilyPlaces.mockResolvedValue(mockSeedPlaces);
      enrichUiPlacesWithGoogle.mockImplementation((places) => places);

      const result = await searchPlaces({
        location: 'Istanbul',
        coords: mockCoords,
        age: '4',
        category: 'park',
        radiusKm: 5,
        intent: 'quick'
      });

      expect(searchFamilyPlaces).toHaveBeenCalledWith({
        location: { lat: mockCoords.lat, lon: mockCoords.lon, label: 'Current location' },
        query: undefined,
        city: 'Istanbul',
        category: 'park',
        age: 4,
        intent: 'quick',
        radius: 5000,
        limit: 36,
        fetchImpl: expect.any(Function),
        useFallback: true
      });
      expect(result.length).toBeGreaterThan(0);
    });

    it('should respect category filter', async () => {
      const { searchFamilyPlaces } = await import('../src/lib/geodata/places.js');
      const { enrichUiPlacesWithGoogle } = await import('../src/lib/googlePlaces.js');
      
      searchFamilyPlaces.mockResolvedValue([]);
      enrichUiPlacesWithGoogle.mockImplementation((places) => places);

      await searchPlaces({
        location: 'Istanbul',
        coords: null,
        age: '4',
        category: 'museum',
        radiusKm: 5,
        intent: 'quick'
      });

      expect(searchFamilyPlaces).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'museum'
        })
      );
    });

    it('should convert age string to number', async () => {
      const { searchFamilyPlaces } = await import('../src/lib/geodata/places.js');
      const { enrichUiPlacesWithGoogle } = await import('../src/lib/googlePlaces.js');
      
      searchFamilyPlaces.mockResolvedValue([]);
      enrichUiPlacesWithGoogle.mockImplementation((places) => places);

      await searchPlaces({
        location: 'Istanbul',
        coords: null,
        age: '7',
        category: 'all',
        radiusKm: 5,
        intent: 'learning'
      });

      expect(searchFamilyPlaces).toHaveBeenCalledWith(
        expect.objectContaining({
          age: 7
        })
      );
    });

    it('should convert radiusKm to meters', async () => {
      const { searchFamilyPlaces } = await import('../src/lib/geodata/places.js');
      const { enrichUiPlacesWithGoogle } = await import('../src/lib/googlePlaces.js');
      
      searchFamilyPlaces.mockResolvedValue([]);
      enrichUiPlacesWithGoogle.mockImplementation((places) => places);

      await searchPlaces({
        location: 'Istanbul',
        coords: null,
        age: '4',
        category: 'all',
        radiusKm: 10,
        intent: 'quick'
      });

      expect(searchFamilyPlaces).toHaveBeenCalledWith(
        expect.objectContaining({
          radius: 10000 // 10 km in meters
        })
      );
    });
  });
});