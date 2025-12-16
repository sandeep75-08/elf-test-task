import React from 'react';
import { Star, RefreshCw } from 'lucide-react';
import { useRandomBrewery } from '../hooks/useBreweries';
import { BreweryCard } from './BreweryCard';
import { BreweryCardSkeleton } from './LoadingSkeleton';
import { LocationCoords } from '../types/brewery';

interface RandomBreweryCardProps {
  userLocation?: LocationCoords;
  onBreweryClick: (breweryId: string) => void;
}

export const RandomBreweryCard: React.FC<RandomBreweryCardProps> = ({
  userLocation,
  onBreweryClick
}) => {
  const { data: randomBrewery, isLoading, refetch, error } = useRandomBrewery(userLocation);

  const handleRefresh = () => {
    refetch();
  };

  if (error) {
    return null; 
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Star className="w-5 h-5 mr-2 text-amber-500" />
          {userLocation ? 'Random Brewery Near You' : 'Random Brewery'}
        </h2>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center text-sm text-amber-600 hover:text-amber-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          New Random
        </button>
      </div>
      
      {isLoading ? (
        <BreweryCardSkeleton />
      ) : randomBrewery ? (
        <BreweryCard
          brewery={randomBrewery}
          onClick={() => onBreweryClick(randomBrewery.id)}
          featured={true}
        />
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <p className="text-gray-600">No random brewery found. Try adjusting your location settings.</p>
        </div>
      )}
    </div>
  );
};