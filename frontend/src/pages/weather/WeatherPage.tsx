import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudRain,
  Sun,
  Wind,
  Droplets,
  ThermometerSun,
  AlertTriangle,
  ChevronLeft,
  CalendarDays,
  ShieldAlert,
  CheckCircle2,
  MapPin,
  Search,
  Loader2,
  Cloud,
  CloudSnow,
  CloudLightning,
  Eye,
  Gauge,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuthStore } from "../../lib/useAuthStore";
import { useFarmStore } from "../../lib/useFarmStore";
import { DemoBanner } from "../../components/ui/demo-banner";
import { useTranslation } from "react-i18next";

// ─── Types ──────────────────────────────────────────────────────────────────

interface GeoResult {
  name: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    village?: string;
    town?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface LiveWeather {
  temperature_c: number;
  feels_like_c: number;
  humidity_pct: number;
  wind_speed_kmh: number;
  uv_index: number;
  cloud_cover_pct: number;
  rain_probability_pct: number;
  visibility_km: number;
  pressure_hpa: number;
  weather_code: number;
  spray_safe: boolean;
  spray_advisory: string;
  fungal_risk_score: number;
  irrigation_advisory: string;
}

interface ForecastDay {
  day: string;
  temp_max: number;
  temp_min: number;
  rain_prob: number;
  weather_code: number;
}

// ─── WMO Weather Code helpers ────────────────────────────────────────────────

function wmoLabel(code: number): string {
  if (code === 0) return "Clear Sky";
  if (code <= 3) return "Partly Cloudy";
  if (code <= 49) return "Foggy";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowy";
  if (code <= 82) return "Showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

function wmoRisk(rainProb: number): "Low" | "Med" | "High" {
  if (rainProb >= 60) return "High";
  if (rainProb >= 30) return "Med";
  return "Low";
}

function WeatherIcon({ code, className }: { code: number; className?: string }) {
  if (code === 0 || code === 1) return <Sun className={className} />;
  if (code <= 3) return <Cloud className={className} />;
  if (code <= 67) return <CloudRain className={className} />;
  if (code <= 77) return <CloudSnow className={className} />;
  if (code <= 82) return <CloudRain className={className} />;
  return <CloudLightning className={className} />;
}

function wmoIconColor(code: number): string {
  if (code === 0 || code === 1) return "text-amber-500";
  if (code <= 3) return "text-slate-400";
  if (code <= 67) return "text-blue-500";
  if (code <= 77) return "text-sky-300";
  return "text-indigo-500";
}

// ─── Geocoding via Nominatim (free, no key) ──────────────────────────────────

async function geocodeVillage(query: string): Promise<GeoResult[]> {
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(query + ", India")}` +
    `&format=json&addressdetails=1&limit=8&countrycodes=in`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);
  return res.json();
}

// ─── Weather via Open-Meteo (free, no key) ───────────────────────────────────

async function fetchOpenMeteoWeather(
  lat: number,
  lon: number
): Promise<{ current: LiveWeather; forecast: ForecastDay[] }> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,cloud_cover,wind_speed_10m,uv_index,pressure_msl,visibility` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&timezone=Asia%2FKolkata&forecast_days=7`;

  const res = await fetch(url);
  const data = await res.json();
  const c = data.current;

  const humidity = c.relative_humidity_2m ?? 65;
  const wind = c.wind_speed_10m ?? 10;
  const rain = c.precipitation_probability ?? 10;
  const cloud = c.cloud_cover ?? 20;
  const uv = c.uv_index ?? 5;
  const code = c.weather_code ?? 0;

  // Agronomic advisories
  const spray_safe = wind < 20 && rain < 40;
  const spray_advisory = spray_safe
    ? `Wind is ${Math.round(wind)} km/h and rain probability is only ${rain}%. Excellent conditions for pesticide application.`
    : `High ${rain}% rain probability or strong winds (${Math.round(wind)} km/h). Avoid spraying — chemicals may wash off or drift.`;

  const fungal_risk_score = Math.min(100, humidity * 0.6 + rain * 0.4);
  const irrigation_advisory =
    rain > 50
      ? `Rain expected (${rain}% probability). Skip irrigation today to avoid waterlogging.`
      : humidity > 70
      ? `Humidity is high at ${humidity}%. Moderate irrigation advised — check soil moisture first.`
      : `Dry conditions detected. Consider irrigating your crops in the next 24 hours.`;

  const current: LiveWeather = {
    temperature_c: c.temperature_2m ?? 30,
    feels_like_c: c.apparent_temperature ?? 32,
    humidity_pct: humidity,
    wind_speed_kmh: wind,
    uv_index: uv,
    cloud_cover_pct: cloud,
    rain_probability_pct: rain,
    visibility_km: (c.visibility ?? 10000) / 1000,
    pressure_hpa: c.pressure_msl ?? 1013,
    weather_code: code,
    spray_safe,
    spray_advisory,
    fungal_risk_score,
    irrigation_advisory,
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const forecast: ForecastDay[] = (data.daily.time as string[]).map(
    (dateStr: string, i: number) => ({
      day: days[new Date(dateStr).getDay()],
      temp_max: Math.round(data.daily.temperature_2m_max[i]),
      temp_min: Math.round(data.daily.temperature_2m_min[i]),
      rain_prob: data.daily.precipitation_probability_max[i] ?? 0,
      weather_code: data.daily.weather_code[i] ?? 0,
    })
  );

  return { current, forecast };
}

// ─── Village Search Bar Component ────────────────────────────────────────────

interface SearchedLocation {
  name: string;
  display_name: string;
  lat: number;
  lon: number;
}

function VillageSearchBar({
  onSelect,
  selectedLocation,
  onClear,
}: {
  onSelect: (loc: SearchedLocation) => void;
  selectedLocation: SearchedLocation | null;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (q.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const data = await geocodeVillage(q.trim());
      setResults(data.slice(0, 6));
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = (r: GeoResult) => {
    const label =
      r.address?.village ||
      r.address?.town ||
      r.address?.city ||
      r.name;
    onSelect({
      name: label,
      display_name: r.display_name,
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
    });
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="relative w-full max-w-lg">
      {selectedLocation ? (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3"
        >
          <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-emerald-900 truncate">{selectedLocation.name}</p>
            <p className="text-xs text-emerald-600 truncate">{selectedLocation.display_name}</p>
          </div>
          <button
            onClick={onClear}
            className="shrink-0 w-7 h-7 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-emerald-700" />
          </button>
        </motion.div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search your village or city name..."
              className="w-full pl-12 pr-12 h-13 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400 bg-white shadow-sm"
            />
            {loading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
            )}
          </div>

          <AnimatePresence>
            {open && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden"
              >
                {results.map((r, i) => {
                  const label =
                    r.address?.village || r.address?.town || r.address?.city || r.name;
                  const sub = [r.address?.state, r.address?.country]
                    .filter(Boolean)
                    .join(", ");
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(r)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors group"
                    >
                      <div className="shrink-0 w-8 h-8 bg-blue-100 group-hover:bg-blue-200 text-blue-600 rounded-full flex items-center justify-center transition-colors">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate group-hover:text-blue-700">
                          {label}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{sub}</p>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function WeatherPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { activeFarm } = useFarmStore();

  const [searchedLocation, setSearchedLocation] = useState<SearchedLocation | null>(null);
  const [liveWeather, setLiveWeather] = useState<LiveWeather | null>(null);
  const [liveForecast, setLiveForecast] = useState<ForecastDay[] | null>(null);
  const [loadingLive, setLoadingLive] = useState(false);
  const [liveError, setLiveError] = useState("");

  // Is this a locally-saved farm (no backend)?
  const isLocalFarm = activeFarm?.id?.startsWith('local-');

  // Backend weather query — only for server-persisted farms
  const { data: realWeather, isLoading, error } = useQuery({
    queryKey: ["weather", activeFarm?.id],
    queryFn: async () => {
      if (!activeFarm) return null;
      const response = await api.get(`/weather/${activeFarm.id}`);
      return response.data;
    },
    enabled: !!user && !!activeFarm && !searchedLocation && !isLocalFarm,
    retry: 1,
  });

  // Auto-fetch live weather from Open-Meteo for local farms or backend errors
  const [farmWeather, setFarmWeather] = useState<LiveWeather | null>(null);
  const [farmForecast, setFarmForecast] = useState<ForecastDay[] | null>(null);
  const [farmWeatherLoading, setFarmWeatherLoading] = useState(false);

  useEffect(() => {
    if (!activeFarm || searchedLocation) return;
    // Fetch from Open-Meteo when farm is local or backend errored
    if (isLocalFarm || (error && activeFarm.lat && activeFarm.lng)) {
      setFarmWeatherLoading(true);
      fetchOpenMeteoWeather(activeFarm.lat, activeFarm.lng)
        .then(({ current, forecast }) => {
          setFarmWeather(current);
          setFarmForecast(forecast);
        })
        .catch(() => setLiveError("Could not fetch live weather for your farm."))
        .finally(() => setFarmWeatherLoading(false));
    }
  }, [activeFarm?.id, isLocalFarm, !!error, searchedLocation]);

  // When user selects a village from the search bar
  const handleLocationSelect = async (loc: SearchedLocation) => {
    setSearchedLocation(loc);
    setLiveError("");
    setLoadingLive(true);
    try {
      const { current, forecast } = await fetchOpenMeteoWeather(loc.lat, loc.lon);
      setLiveWeather(current);
      setLiveForecast(forecast);
    } catch {
      setLiveError("Could not fetch weather. Please try again.");
    } finally {
      setLoadingLive(false);
    }
  };

  const handleClear = () => {
    setSearchedLocation(null);
    setLiveWeather(null);
    setLiveForecast(null);
    setLiveError("");
  };

  // Resolve which weather data to show (priority: search > live farm > backend > mock)
  const weather: LiveWeather | null = searchedLocation
    ? liveWeather
    : farmWeather   // local farm or fallback from backend error
    ?? realWeather  // backend data
    ?? {
        temperature_c: 32,
        feels_like_c: 34,
        humidity_pct: 65,
        wind_speed_kmh: 12,
        uv_index: 8,
        cloud_cover_pct: 20,
        rain_probability_pct: 10,
        visibility_km: 10,
        pressure_hpa: 1013,
        weather_code: 1,
        spray_safe: true,
        spray_advisory:
          "Winds are low and no rain is expected until Tuesday. The next 24 hours are optimal for applying fungicides.",
        fungal_risk_score: 60,
        irrigation_advisory:
          "Soil moisture is optimal. No irrigation is needed for the next 48 hours.",
      };

  const locationLabel = searchedLocation
    ? searchedLocation.name
    : activeFarm
    ? `${activeFarm.village || activeFarm.name}${activeFarm.district ? `, ${activeFarm.district}` : ""}`
    : "Demo Location";

  const showLoading =
    (user && activeFarm && isLoading && !searchedLocation && !isLocalFarm) ||
    loadingLive ||
    farmWeatherLoading;

  if (user && !activeFarm && !searchedLocation) {
    return (
      <>
        <div className="container mx-auto p-4 md:p-8 max-w-5xl">
          {/* Header stays visible */}
          <div className="flex items-center gap-4 border-b border-gray-100 pb-6 mb-8">
            <Link
              to="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                {t("weather.title")}
              </h1>
            </div>
          </div>

          {/* Search prompt */}
          <div className="flex flex-col items-center text-center mb-10 gap-4">
            <MapPin className="w-14 h-14 text-gray-300" />
            <h2 className="text-xl font-bold text-gray-900">No Farm Set Up Yet</h2>
            <p className="text-gray-500 max-w-sm">
              Search for your village below to get real-time agricultural weather instantly.
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <VillageSearchBar
              onSelect={handleLocationSelect}
              selectedLocation={searchedLocation}
              onClear={handleClear}
            />
          </div>

          {loadingLive && (
            <div className="flex flex-col items-center py-12 gap-3">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-gray-500 font-medium animate-pulse">
                Fetching live weather for {searchedLocation?.name}...
              </p>
            </div>
          )}
        </div>
        {liveWeather && renderWeatherContent()}
      </>
    );
  }

  if (showLoading) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">
          {loadingLive
            ? `Fetching live weather for ${searchedLocation?.name}...`
            : "Fetching precise agricultural weather..."}
        </p>
      </div>
    );
  }

  if (user && error && !searchedLocation && !farmWeather && !farmWeatherLoading) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertTriangle className="w-16 h-16 text-rose-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Weather Unavailable</h2>
        <p className="text-gray-500 mt-2">
          We couldn't fetch the latest weather for your farm. Please try again.
        </p>
      </div>
    );
  }

  function renderWeatherContent() {
    const MOCK_FORECAST: ForecastDay[] = [
      { day: "Mon", temp_max: 32, temp_min: 26, rain_prob: 10, weather_code: 0 },
      { day: "Tue", temp_max: 30, temp_min: 25, rain_prob: 60, weather_code: 61 },
      { day: "Wed", temp_max: 28, temp_min: 24, rain_prob: 75, weather_code: 63 },
      { day: "Thu", temp_max: 29, temp_min: 25, rain_prob: 35, weather_code: 2 },
      { day: "Fri", temp_max: 31, temp_min: 26, rain_prob: 10, weather_code: 0 },
      { day: "Sat", temp_max: 33, temp_min: 27, rain_prob: 5, weather_code: 0 },
      { day: "Sun", temp_max: 32, temp_min: 26, rain_prob: 15, weather_code: 1 },
    ];

    const forecast = liveForecast || farmForecast || MOCK_FORECAST;

    return (
      <div className="container mx-auto p-4 md:p-8 space-y-8 pb-24 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4 flex-1">
            <Link
              to="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200 shrink-0"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                {t("weather.title")}
              </h1>
              <p className="text-gray-500 font-medium flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {locationLabel} • {searchedLocation ? "Live Data" : "Updated Just Now"}
              </p>
            </div>
          </div>

          {/* Village Search Bar always visible in header */}
          <VillageSearchBar
            onSelect={handleLocationSelect}
            selectedLocation={searchedLocation}
            onClear={handleClear}
          />
        </div>

        {liveError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
            <p className="text-rose-700 font-medium text-sm">{liveError}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Weather Card */}
            <motion.div
              key={locationLabel}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/20 relative"
            >
              <div className="absolute top-0 right-0 p-8 opacity-20">
                <WeatherIcon
                  code={weather?.weather_code ?? 0}
                  className="h-48 w-48"
                />
              </div>

              <div className="p-8 relative z-10">
                <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-md mb-6">
                  {wmoLabel(weather?.weather_code ?? 0)}
                </div>
                <div className="flex items-end gap-6 mb-8">
                  <h2 className="text-7xl font-black tracking-tighter">
                    {Math.round(weather?.temperature_c ?? 32)}°C
                  </h2>
                  <div className="pb-2">
                    <p className="text-2xl font-bold">
                      {wmoLabel(weather?.weather_code ?? 0)}
                    </p>
                    <p className="text-blue-100 font-medium">
                      Feels like {Math.round(weather?.feels_like_c ?? 34)}°C
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-6">
                  <div>
                    <div className="flex items-center gap-1.5 text-blue-100 mb-1 text-sm font-medium">
                      <Droplets className="w-4 h-4" /> {t("weather.humidity")}
                    </div>
                    <p className="font-bold text-xl">{weather?.humidity_pct ?? 65}%</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-blue-100 mb-1 text-sm font-medium">
                      <Wind className="w-4 h-4" /> {t("weather.wind")}
                    </div>
                    <p className="font-bold text-xl">
                      {Math.round(weather?.wind_speed_kmh ?? 12)} km/h
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-blue-100 mb-1 text-sm font-medium">
                      <Sun className="w-4 h-4" /> UV Index
                    </div>
                    <p className="font-bold text-xl">
                      {weather?.uv_index ?? 5}{" "}
                      <span className="text-xs font-normal text-amber-200">
                        ({(weather?.uv_index ?? 5) > 6 ? "High" : "Moderate"})
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Extra metrics row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  icon: <Eye className="w-5 h-5" />,
                  label: "Visibility",
                  value: `${Math.round(weather?.visibility_km ?? 10)} km`,
                  color: "bg-sky-50 text-sky-600",
                },
                {
                  icon: <Gauge className="w-5 h-5" />,
                  label: "Pressure",
                  value: `${Math.round(weather?.pressure_hpa ?? 1013)} hPa`,
                  color: "bg-violet-50 text-violet-600",
                },
                {
                  icon: <CloudRain className="w-5 h-5" />,
                  label: t("weather.rain"),
                  value: `${weather?.rain_probability_pct ?? 10}%`,
                  color: "bg-blue-50 text-blue-600",
                },
              ].map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="border-0 shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-2xl p-4 text-center bg-white">
                    <div
                      className={`w-10 h-10 ${m.color} rounded-xl flex items-center justify-center mx-auto mb-2`}
                    >
                      {m.icon}
                    </div>
                    <p className="text-xs text-gray-400 font-medium">{m.label}</p>
                    <p className="font-bold text-gray-900 text-lg">{m.value}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* 7-Day Forecast */}
            <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">7-Day Forecast</h2>
              </div>

              <div className="flex justify-between overflow-x-auto pb-4 gap-4 hide-scrollbar">
                {forecast.map((day, i) => {
                  const risk = wmoRisk(day.rain_prob);
                  const iconColor = wmoIconColor(day.weather_code);
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 min-w-[64px]">
                      <span className="text-sm font-bold text-gray-500">{day.day}</span>
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center bg-gray-50 ${iconColor}`}
                      >
                        <WeatherIcon code={day.weather_code} className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <p className="font-black text-gray-900 text-base">{day.temp_max}°</p>
                        <p className="text-xs text-gray-400">{day.temp_min}°</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          risk === "High"
                            ? "text-rose-500"
                            : risk === "Med"
                            ? "text-amber-500"
                            : "text-emerald-500"
                        }`}
                      >
                        {risk} Risk
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white h-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Agricultural Alerts
                </h2>

                <div className="space-y-4">
                  {/* Spraying */}
                  <div
                    className={`p-5 rounded-2xl border flex gap-4 ${
                      weather?.spray_safe
                        ? "bg-emerald-50 border-emerald-100"
                        : "bg-rose-50 border-rose-100"
                    }`}
                  >
                    <div
                      className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                        weather?.spray_safe
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-rose-100 text-rose-600"
                      }`}
                    >
                      {weather?.spray_safe ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <ShieldAlert className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h3
                        className={`font-bold ${
                          weather?.spray_safe ? "text-emerald-900" : "text-rose-900"
                        }`}
                      >
                        {weather?.spray_safe
                          ? "Optimal Spraying Window"
                          : "Spraying Not Recommended"}
                      </h3>
                      <p
                        className={`text-sm mt-1 leading-relaxed ${
                          weather?.spray_safe ? "text-emerald-800" : "text-rose-800"
                        }`}
                      >
                        {weather?.spray_advisory}
                      </p>
                    </div>
                  </div>

                  {/* Fungal risk */}
                  {(weather?.fungal_risk_score ?? 0) > 50 && (
                    <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4">
                      <div className="shrink-0 h-10 w-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                        <ShieldAlert className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-amber-900">Elevated Fungal Risk</h3>
                        <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                          Humidity of {weather?.humidity_pct}% increases the risk of Blight and
                          mildew spreading.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Irrigation */}
                  <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 flex gap-4">
                    <div className="shrink-0 h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <Droplets className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-900">Irrigation Advisory</h3>
                      <p className="text-sm text-blue-800 mt-1 leading-relaxed">
                        {weather?.irrigation_advisory}
                      </p>
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-6 h-12 bg-gray-900 text-white rounded-xl">
                  View Full Advisory Report
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {!user && <DemoBanner />}
      {renderWeatherContent()}
    </>
  );
}
