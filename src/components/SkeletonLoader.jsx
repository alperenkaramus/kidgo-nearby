import { Baby, Compass, MapPin, Navigation, Search, Sparkles, Telescope, TrendingUp, Umbrella } from 'lucide-react';

export default function SkeletonLoader() {
  return (
    <div className="skeleton-loader">
      <div className="skeleton-header">
        <div className="skeleton-line w-3/4"></div>
        <div className="skeleton-line w-1/2"></div>
        <div className="skeleton-line w-full h-4"></div>
      </div>
      
      <div className="skeleton-content space-y-4">
        {/* Search panel skeleton */}
        <div className="skeleton-search-panel">
          <div className="skeleton-input w-full h-10"></div>
          <div className="skeleton-actions flex space-x-2">
            <div className="skeleton-button w-24 h-10"></div>
            <div className="skeleton-button w-24 h-10"></div>
          </div>
        </div>
        
        {/* Filters skeleton */}
        <div className="skeleton-filters">
          <div className="skeleton-chip w-20 h-8"></div>
          <div className="skeleton-chip w-20 h-8"></div>
          <div className="skeleton-chip w-20 h-8"></div>
          <div className="skeleton-chip w-20 h-8"></div>
        </div>
        
        {/* Results skeleton */}
        <div className="skeleton-results space-y-3">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <div key={index} className="skeleton-card">
              <div className="skeleton-image h-24 w-full rounded"></div>
              <div className="skeleton-content space-y-2">
                <div className="skeleton-line w-3/4 h-4"></div>
                <div className="skeleton-line w-full h-4"></div>
                <div className="skeleton-line w-2/3 h-4"></div>
                <div className="skeleton-line w-1/2 h-4"></div>
                <div className="skeleton-line w-full h-4"></div>
                <div className="skeleton-actions flex space-x-2">
                  <div className="skeleton-button w-24 h-8"></div>
                  <div className="skeleton-button w-24 h-8"></div>
                  <div className="skeleton-button w-24 h-8"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}