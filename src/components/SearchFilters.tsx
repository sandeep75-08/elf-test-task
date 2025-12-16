import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { FilterState } from '../types/brewery';
import { getCurrentLocation } from '../utils/geolocation';
import { useBrewerySearch } from '../hooks/useBreweries';

interface SearchFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

const DISTANCES = [25, 50, 100]

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  className = ''
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const { data: suggestions = [], isLoading: loadingSuggestions } = useBrewerySearch(filters.search);

  const handleLocationRequest = async () => {
    setGettingLocation(true);
    setLocationError([]);
    // setLo
    
    try {
      console.log('Requesting location...');
      const location = await getCurrentLocation();
      onFiltersChange({ ...filters, userLocation: location });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location';
      console.error('Location error:', errorMessage);
      setLocationError(errorMessage);
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSuggestionClick = (breweryName: string) => {
    onFiltersChange({ ...filters, search: breweryName });
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      city: '',
      state: '',
      distance: null,
      userLocation: null
    });
    setLocationError(null);
  };

  const hasActiveFilters = filters.search || filters.city || filters.state || filters.distance;

  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-amber-600" />
          Search & Filter
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center transition-colors"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search breweries..."
              value={filters.search}
              onChange={(e) => {
                onFiltersChange({ ...filters, search: e.target.value });
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
            {loadingSuggestions && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
            )}
          </div>
          
          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((brewery) => (
                <button
                  key={brewery.id}
                  onClick={() => handleSuggestionClick(brewery.name)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="font-medium text-gray-900">{brewery.name}</div>
                  <div className="text-sm text-gray-500">{brewery.city}, {brewery.state}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Filter by city"
            value={filters.city}
            onChange={(e) => onFiltersChange({ ...filters, city: e.target.value })}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
          <input
            type="text"
            placeholder="Filter by state"
            value={filters.state}
            onChange={(e) => onFiltersChange({ ...filters, state: e.target.value })}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Distance Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Filter by Distance</label>
            {!filters.userLocation && (
              <button
                onClick={handleLocationRequest}
                disabled={gettingLocation}
                className="flex items-center text-sm text-amber-600 hover:text-amber-700 disabled:opacity-50 transition-colors"
              >
                {gettingLocation ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4 mr-1" />
                )}
                {gettingLocation ? 'Getting Location...' : 'Enable Location'}
              </button>
            )}
          </div>
          
          {locationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-600">{locationError}</p>
                  <button
                    onClick={handleLocationRequest}
                    className="text-sm text-red-700 hover:text-red-800 mt-1 underline"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {filters.userLocation && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700">
                  Location enabled ({filters.userLocation.latitude.toFixed(4)}, {filters.userLocation.longitude.toFixed(4)})
                </span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-2">
            {DISTANCES.map((distance) => (
              <button
                key={distance}
                onClick={() => onFiltersChange({ 
                  ...filters, 
                  distance: filters.distance === distance ? null : distance 
                })}
                disabled={!filters.userLocation}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  filters.distance === distance
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {distance} mi
              </button>
            ))}
          </div>
          
          {!filters.userLocation && (
            <p className="text-xs text-gray-500">
              Enable location to filter breweries by distance
            </p>
          )}
          
          {filters.distance && filters.userLocation && (
            <p className="text-xs text-blue-600">
              Showing breweries within {filters.distance} miles of your location
            </p>
          )}
        </div>
      </div>
    </div>
  );
};