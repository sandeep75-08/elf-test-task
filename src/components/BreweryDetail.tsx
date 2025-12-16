import React from 'react';
import { ArrowLeft, MapPin, Phone, ExternalLink, Globe, Clock, AlertCircle } from 'lucide-react';
import { Brewery } from '../types/brewery';
import { useBrewery } from '../hooks/useBreweries';
import { BreweryDetailSkeleton } from './LoadingSkeleton';
import { ErrorFallback } from './ErrorBoundary';

interface BreweryDetailProps {
  breweryId: string;
  onBack: () => void;
}

export const BreweryDetail: React.FC<BreweryDetailProps> = ({ breweryId, onBack }) => {
  const { data: brewery, isLoading, error, refetch } = useBrewery(breweryId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <button 
          onClick={onBack}
          className="flex items-center text-amber-600 hover:text-amber-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Breweries
        </button>
        <BreweryDetailSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button 
          onClick={onBack}
          className="flex items-center text-amber-600 hover:text-amber-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Breweries
        </button>
        <ErrorFallback 
          error={error instanceof Error ? error : new Error('Failed to load brewery')}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!brewery) {
    return (
      <div className="space-y-6">
        <button 
          onClick={onBack}
          className="flex items-center text-amber-600 hover:text-amber-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Breweries
        </button>
        <ErrorFallback title="Brewery Not Found" message="This brewery doesn't exist or has been removed." />
      </div>
    );
  }

  const formatAddress = () => {
    const parts = [brewery.address_1, brewery.address_2, brewery.address_3].filter(Boolean);
    return parts.join(', ');
  };

  const formatBreweryType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const openInMaps = () => {
    const address = [brewery.address_1, brewery.city, brewery.state, brewery.postal_code]
      .filter(Boolean)
      .join(', ');
    window.open(`https://maps.google.com/maps?q=${encodeURIComponent(address)}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center text-amber-600 hover:text-amber-700 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Breweries
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-8 py-6">
          <h1 className="text-3xl font-bold text-white mb-2">{brewery.name}</h1>
          <div className="flex items-center space-x-4">
            <span className="inline-block px-3 py-1 bg-white/20 text-white text-sm rounded-full">
              {formatBreweryType(brewery.brewery_type)}
            </span>
            <span className="text-amber-100">
              {brewery.city}, {brewery.state}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              
              {brewery.address_1 && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">Address</p>
                    <p className="text-gray-600 mt-1">
                      {formatAddress()}
                      <br />
                      {brewery.city}, {brewery.state} {brewery.postal_code}
                      <br />
                      {brewery.country}
                    </p>
                    <button
                      onClick={openInMaps}
                      className="mt-2 text-sm text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      Open in Maps →
                    </button>
                  </div>
                </div>
              )}

              {brewery.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900 font-medium">Phone</p>
                    <a 
                      href={`tel:${brewery.phone}`}
                      className="text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      {brewery.phone}
                    </a>
                  </div>
                </div>
              )}

              {brewery.website_url && (
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900 font-medium">Website</p>
                    <a 
                      href={brewery.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-700 transition-colors flex items-center"
                    >
                      Visit Website
                      <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Details</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Brewery Type:</span>
                  <span className="text-gray-900">{formatBreweryType(brewery.brewery_type)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">State:</span>
                  <span className="text-gray-900">{brewery.state}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Country:</span>
                  <span className="text-gray-900">{brewery.country}</span>
                </div>
              </div>

              {brewery.latitude && brewery.longitude && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Location Coordinates</span>
                  </div>
                  <p className="text-blue-800 text-sm">
                    Latitude: {brewery.latitude}<br />
                    Longitude: {brewery.longitude}
                  </p>
                </div>
              )}

              {/* Helpful Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-amber-800 font-medium text-sm">Please verify before visiting</p>
                    <p className="text-amber-700 text-sm mt-1">
                      Hours, availability, and services may vary. We recommend calling ahead or checking their website for the most current information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};