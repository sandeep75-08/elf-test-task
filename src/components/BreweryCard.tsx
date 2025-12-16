import React from 'react';
import { MapPin, Phone, ExternalLink, Star, Navigation } from 'lucide-react';
import { Brewery } from '../types/brewery';

interface BreweryCardProps {
  brewery: Brewery & { distance?: number };
  onClick: () => void;
  onMouseEnter?: () => void;
  featured?: boolean;
}

export const BreweryCard: React.FC<BreweryCardProps> = ({ 
  brewery, 
  onClick, 
  onMouseEnter,
  featured = false 
}) => {
  const formatAddress = () => {
    const parts = [brewery.address_1, brewery.city, brewery.state, brewery.postal_code].filter(Boolean);
    return parts.join(', ');
  };

  const formatBreweryType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div 
      className={`group bg-white rounded-xl p-6 shadow-sm border transition-all duration-200 cursor-pointer hover:shadow-lg hover:border-amber-200 ${
        featured ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-white' : 'border-gray-100'
      }`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {featured && (
        <div className="flex items-center mb-3">
          <Star className="w-4 h-4 text-amber-500 mr-1" />
          <span className="text-sm font-medium text-amber-700">Featured Recommendation</span>
        </div>
      )}
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-700 transition-colors mb-2">
          {brewery.name}
        </h3>
        <div className="flex items-center space-x-2">
          <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
            {formatBreweryType(brewery.brewery_type)}
          </div>
          {brewery.distance !== undefined && brewery.distance !== Infinity && (
            <div className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              <Navigation className="w-3 h-3 mr-1" />
              {brewery.distance.toFixed(1)} mi
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {brewery.address_1 && (
          <div className="flex items-start text-gray-600">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
            <span className="text-sm">{formatAddress()}</span>
          </div>
        )}
        
        {brewery.phone && (
          <div className="flex items-center text-gray-600">
            <Phone className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
            <span className="text-sm">{brewery.phone}</span>
          </div>
        )}
        
        {brewery.website_url && (
          <div className="flex items-center text-gray-600">
            <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
            <span className="text-sm truncate">{brewery.website_url}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {brewery.city}, {brewery.state}
        </span>
        <button className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors group-hover:scale-105 transform duration-200">
          View Details
        </button>
      </div>
    </div>
  );
};