import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, Plus, Navigation } from 'lucide-react';
import { api } from '../../lib/api';
import { useFarmStore } from '../../lib/useFarmStore';
import { Button } from '../ui/button';

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
            // Reverse geocode via backend
            const res = await api.get(`/location/reverse`, { params: { lat: latitude, lng: longitude } });
            
            // Create farm
            const farmPayload = {
              name: `My Farm - ${res.data.name || 'Current Location'}`,
              lat: latitude,
              lng: longitude,
              village: res.data.name,
              district: res.data.district,
              state: res.data.state
            };
            
            const createRes = await api.post('/farms/', farmPayload);
            addFarm(createRes.data);
            if (onClose) onClose();
          } catch (error: any) {
            console.error("Save farm error:", error);
            const msg = error.response?.data?.detail || error.message || 'Unknown error';
            setGeoError(`Failed to save farm location. Error: ${msg}`);
            setStep('intro');
          }
        },
        (error) => {
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
    try {
      const res = await api.get(`/location/search`, { params: { query: searchQuery } });
      setSearchResults(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectManualLocation = async (loc: any) => {
    setStep('saving');
    try {
      const farmPayload = {
        name: `My Farm - ${loc.name}`,
        lat: loc.lat,
        lng: loc.lng,
        village: loc.name,
        state: loc.state
      };
      const createRes = await api.post('/farms/', farmPayload);
      addFarm(createRes.data);
      if (onClose) onClose();
    } catch (error: any) {
      console.error("Manual save farm error:", error);
      const msg = error.response?.data?.detail || error.message || 'Unknown error';
      setGeoError(`Failed to save farm location. Error: ${msg}`);
      setStep('manual');
    }
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
                    placeholder="Village, City, or PIN Code..."
                    className="w-full pl-10 pr-4 h-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>
                <Button type="submit" className="h-12 px-6" disabled={isSearching}>
                  {isSearching ? '...' : 'Search'}
                </Button>
              </form>

              {geoError && <p className="text-rose-500 text-sm font-medium">{geoError}</p>}

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {searchResults.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectManualLocation(loc)}
                    className="w-full text-left p-4 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-700">{loc.name}</h4>
                      <p className="text-sm text-gray-500">{loc.state} {loc.country}</p>
                    </div>
                    <Plus className="text-gray-300 group-hover:text-blue-500 w-5 h-5" />
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
