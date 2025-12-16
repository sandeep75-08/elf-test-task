import React, { useState, useEffect } from 'react';

import { Beer, Heart } from 'lucide-react';
import { FilterState } from '../types/brewery';
import { SearchFilters } from './SearchFilters';
import { BreweryCard } from './BreweryCard';
import { BreweryDetail } from './BreweryDetail';
import { Pagination } from './Pagination';
import { RandomBreweryCard } from './RandomBreweryCard';
import { BreweryCardSkeleton } from './LoadingSkeleton';
import {  NetworkError } from './ErrorBoundary';
import { useBreweries, usePrefetchBrewery } from '../hooks/useBreweries';
import { getCurrentLocation } from '../utils/geolocation';
export const BreweryApp: React.FC = () => {
  const [selectedBreweryId, setSelectedBreweryId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    city: '',
    state: '',
    distance: null,
    userLocation: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { data: breweries = [], isLoading, error, refetch } = useBreweries(
    filters, 
    currentPage, 
    itemsPerPage
  );
  
  const prefetchBrewery = usePrefetchBrewery();

  // Automatically get user's location on initial load
  useEffect(() => {
    const getInitialLocation = async () => {
      try {
        const location = await getCurrentLocation();
        
        setFilters(prev => ({ ...prev, userLocation: location }));
      } catch (error) {
        console.log('Location not available:', error);
      }
    };

    getInitialLocation();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleBreweryClick = (breweryId: string) => {
    setSelectedBreweryId(breweryId);
  };

  const handleBackToList = () => {
    setSelectedBreweryId(null);
  };

  const handleBreweryHover = (breweryId: string) => {
    prefetchBrewery(breweryId);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  if (selectedBreweryId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <BreweryDetail 
            breweryId={selectedBreweryId} 
            onBack={handleBackToList}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Beer className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">BreweryFinder</h1>
                <p className="text-gray-600">Discover amazing breweries across America</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center text-sm text-gray-500">
              Made with <Heart className="w-4 h-4 mx-1 text-red-500" /> for beer lovers
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters 
              filters={filters}
              onFiltersChange={handleFiltersChange}
              className="sticky top-4"
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Random Brewery */}
            <RandomBreweryCard
              userLocation={filters.userLocation || undefined}
              onBreweryClick={handleBreweryClick}
            />

            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {filters.search || filters.city || filters.state || filters.distance
                  ? 'Search Results'
                  : 'All Breweries'
                }
              </h2>
              {breweries.length > 0 && (
                <span className="text-sm text-gray-500">
                  {breweries.length} breweries found
                </span>
              )}
            </div>

            {/* Error State */}
            {error && (
              <NetworkError onRetry={() => refetch()} />
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <BreweryCardSkeleton key={index} />
                ))}
              </div>
            )}

            {/* Brewery Grid */}
            {!isLoading && !error && breweries.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {breweries.map((brewery) => (
                    <BreweryCard
                      key={brewery.id}
                      brewery={brewery}
                      onClick={() => handleBreweryClick(brewery.id)}
                      onMouseEnter={() => handleBreweryHover(brewery.id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalItems={breweries.length < itemsPerPage ? 
                    ((currentPage - 1) * itemsPerPage) + breweries.length : 
                    currentPage * itemsPerPage + 1
                  }
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </>
            )}

            {/* Empty State */}
            {!isLoading && !error && breweries.length === 0 && (
              <div className="text-center py-12">
                <Beer className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No breweries found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or clearing your filters.
                </p>
                <button
                  onClick={() => setFilters({
                    search: '',
                    city: '',
                    state: '',
                    distance: null,
                    userLocation: filters.userLocation
                  })}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>Data provided by <a href="https://www.openbrewerydb.org/" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700">Open Brewery DB</a></p>
            <p className="mt-2 text-sm">Drink responsibly. Please verify brewery information before visiting.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};