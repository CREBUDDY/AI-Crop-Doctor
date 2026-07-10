import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Plus, Navigation, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useFarmStore } from '../../lib/useFarmStore';
import { Button } from '../ui/button';

// Free geocoding via Nominatim — no API key required
async function nominatimSearch(query: string) {
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(query + ', India')}` +
    `&format=json&addressdetails=1&limit=8&countrycodes=in`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding failed');
  return res.json() as Promise<any[]>;
}

async function nominatimReverse(lat: number, lon: number) {
  const url =
    `https://nominatim.openstreetmap.org/reverse` +
    `?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Reverse geocoding failed');
  return res.json();
}

export function FarmSetupModal({ isOpen, onClose }: { isOpen: boolean, onClose?: () => void }) {
  const [step, setStep] = useState<'intro' | 'geolocation' | 'manual' | 'saving'>('intro');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [geoError, setGeoError] = useState('');
  
  const { addFarm } = useFarmStore();

  const handleUseLocation = () => {
    setStep('geolocation');
    setGeoError('');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            setStep('saving');
            const { latitude, longitude } = position.coords;
            // Reverse geocode via Nominatim (free, no backend needed)
            const geo = await nominatimReverse(latitude, longitude);
            const addr = geo.address || {};
            const villageName =
              addr.village || addr.town || addr.suburb || addr.city || geo.name || 'My Farm';

            const farmPayload = {
              name: `My Farm - ${villageName}`,
              lat: latitude,
              lng: longitude,
              village: villageName,
              district: addr.county || addr.district || '',
              state: addr.state || ''
            };

            try {
              const createRes = await api.post('/farms/', farmPayload);
              addFarm(createRes.data);
            } catch (saveError: any) {
              // Backend unavailable — save locally
              const isNetworkError = !saveError.response;
              if (isNetworkError) {
                addFarm({ id: `local-${Date.now()}`, ...farmPayload });
              } else {
                throw saveError; // re-throw real server errors
              }
            }
            if (onClose) onClose();
          } catch (error: any) {
            console.error('Save farm error:', error);
            const msg = error.response?.data?.detail || error.message || 'Unknown error';
            setGeoError(`Failed to save farm location. Error: ${msg}`);
            setStep('intro');
          }
        },
        () => {
          setGeoError('Location access denied or failed. Please search manually.');
          setStep('manual');
        }
      );
    } else {
      setGeoError('Geolocation not supported by your browser.');
      setStep('manual');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    try {
      // Use Nominatim directly — no backend required
      const data = await nominatimSearch(searchQuery.trim());
      const results = data.map((r: any) => ({
        name: r.address?.village || r.address?.town || r.address?.suburb || r.address?.city || r.name,
        display_name: r.display_name,
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        state: r.address?.state || '',
        country: r.address?.country || '',
      }));
      setSearchResults(results);
      if (results.length === 0) setGeoError('No locations found. Try a nearby town or city name.');
      else setGeoError('');
    } catch (error) {
      console.error(error);
      setGeoError('Search failed. Please check your internet connection.');
    } finally {
      setIsSearching(false);
    }
  };

  const selectManualLocation = async (loc: any) => {
    setStep('saving');
    const farmPayload = {
      name: `My Farm - ${loc.name}`,
      lat: loc.lat,
      lng: loc.lng,
      village: loc.name,
      state: loc.state,
      district: loc.district || '',
    };
    try {
      // Try to persist to backend (requires login + server)
      const createRes = await api.post('/farms/', farmPayload);
      addFarm(createRes.data);
    } catch (error: any) {
      // Backend unavailable — save locally so weather still works
      const isNetworkError = !error.response;
      if (isNetworkError) {
        addFarm({ id: `local-${Date.now()}`, ...farmPayload });
      } else {
        console.error('Manual save farm error:', error);
        const msg = error.response?.data?.detail || error.message || 'Unknown error';
        setGeoError(`Failed to save farm location. Error: ${msg}`);
        setStep('manual');
        return;
      }
    }
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="p-8">
          
          {step === 'intro' && (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Your Farm Location</h2>
                <p className="text-gray-500">We need your farm's location to provide accurate weather forecasts, disease risks, and irrigation advice.</p>
              </div>
              
              {geoError && <p className="text-rose-500 text-sm font-medium bg-rose-50 p-3 rounded-xl">{geoError}</p>}
              
              <div className="space-y-3">
                <Button 
                  onClick={handleUseLocation}
                  className="w-full flex items-center justify-center gap-2 h-12 text-base"
                >
                  <Navigation className="w-5 h-5" />
                  Use My Current Location
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setStep('manual')}
                  className="w-full flex items-center justify-center gap-2 h-12 text-base"
                >
                  <Search className="w-5 h-5" />
                  Search Manually
                </Button>
              </div>
            </div>
          )}

          {step === 'geolocation' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-gray-900">Locating your farm...</h2>
              <p className="text-gray-500 mt-2">Please allow location access if prompted.</p>
            </div>
          )}

          {step === 'saving' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-gray-900">Saving Farm...</h2>
              <p className="text-gray-500 mt-2">Setting up your hyper-local dashboard.</p>
            </div>
          )}

          {step === 'manual' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <button onClick={() => setStep('intro')} className="text-gray-400 hover:text-gray-600">
                  <Navigation className="w-5 h-5 rotate-180" />
                </button>
                <h2 className="text-xl font-bold text-gray-900">Search Location</h2>
              </div>
              
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Village, City, or Taluka name..."
                    className="w-full pl-10 pr-4 h-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>
                <Button type="submit" className="h-12 px-6" disabled={isSearching}>
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </Button>
              </form>

              {geoError && <p className="text-rose-500 text-sm font-medium">{geoError}</p>}

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {searchResults.length === 0 && !isSearching && searchQuery.length > 0 && !geoError && (
                  <p className="text-sm text-gray-400 text-center py-4">No results found.</p>
                )}
                {searchResults.map((loc: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => selectManualLocation(loc)}
                    className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-700">{loc.name}</h4>
                      <p className="text-sm text-gray-500 truncate max-w-[260px]">{loc.display_name || `${loc.state}, ${loc.country}`}</p>
                    </div>
                    <Plus className="text-gray-300 group-hover:text-blue-500 w-5 h-5 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
