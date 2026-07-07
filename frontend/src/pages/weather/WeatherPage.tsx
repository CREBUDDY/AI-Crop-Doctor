import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  MapPin
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

const MOCK_WEATHER = {
  temperature_c: 32,
  feels_like_c: 34,
  humidity_pct: 65,
  wind_speed_kmh: 12,
  uv_index: 8,
  cloud_cover_pct: 20,
  rain_probability_pct: 10,
  spray_safe: true,
  spray_advisory: "Winds are low and no rain is expected until Tuesday. The next 24 hours are optimal for applying fungicides.",
  fungal_risk_score: 60,
  irrigation_advisory: "Soil moisture is optimal. No irrigation is needed for the next 48 hours."
};

const MOCK_FORECAST = [
  { day: "Mon", temp: "32°", icon: Sun, color: "text-amber-500", risk: "Low" },
  { day: "Tue", temp: "30°", icon: CloudRain, color: "text-blue-500", risk: "Med" },
  { day: "Wed", temp: "28°", icon: CloudRain, color: "text-blue-500", risk: "High" },
  { day: "Thu", temp: "29°", icon: Sun, color: "text-amber-500", risk: "Med" },
  { day: "Fri", temp: "31°", icon: Sun, color: "text-amber-500", risk: "Low" },
  { day: "Sat", temp: "33°", icon: Sun, color: "text-amber-500", risk: "Low" },
  { day: "Sun", temp: "32°", icon: Sun, color: "text-amber-500", risk: "Low" }
];

export function WeatherPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { activeFarm } = useFarmStore();

  const { data: realWeather, isLoading, error } = useQuery({
    queryKey: ['weather', activeFarm?.id],
    queryFn: async () => {
      if (!activeFarm) return null;
      const response = await api.get(`/weather/${activeFarm.id}`);
      return response.data;
    },
    enabled: !!user && !!activeFarm
  });

  const weather = user && activeFarm ? realWeather : MOCK_WEATHER;

  if (user && !activeFarm) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <MapPin className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">No Farm Selected</h2>
        <p className="text-gray-500 mt-2">Please set up a farm location to view hyper-local weather.</p>
      </div>
    );
  }

  if (user && isLoading) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Fetching precise agricultural weather...</p>
      </div>
    );
  }

  if (user && error) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertTriangle className="w-16 h-16 text-rose-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Weather Unavailable</h2>
        <p className="text-gray-500 mt-2">We couldn't fetch the latest weather for your farm. Please try again.</p>
      </div>
    );
  }

  return (
    <>
      {!user && <DemoBanner />}
      <div className="container mx-auto p-4 md:p-8 space-y-8 pb-24 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
        <Link to="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{t('weather.title')}</h1>
          <p className="text-gray-500 font-medium flex items-center gap-1 mt-1">
            <MapPin className="w-4 h-4" /> 
            {activeFarm ? `${activeFarm.village || activeFarm.name}${activeFarm.district ? `, ${activeFarm.district}` : ''}` : 'Demo Location'} • Updated Just Now
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Column: Current Weather & Metrics */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Weather Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/20 relative"
          >
            <div className="absolute top-0 right-0 p-8 opacity-20">
              {weather?.rain_probability_pct > 50 ? <CloudRain className="h-48 w-48" /> : <ThermometerSun className="h-48 w-48" />}
            </div>
            
            <div className="p-8 relative z-10">
              <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-md mb-6">
                Currently
              </div>
              <div className="flex items-end gap-6 mb-8">
                <h2 className="text-7xl font-black tracking-tighter">{Math.round(weather?.temperature_c || 32)}°C</h2>
                <div className="pb-2">
                  <p className="text-2xl font-bold">{weather?.cloud_cover_pct > 50 ? "Cloudy" : "Mostly Sunny"}</p>
                  <p className="text-blue-100 font-medium">Feels like {Math.round(weather?.feels_like_c || 34)}°C</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-6">
                <div>
                  <div className="flex items-center gap-1.5 text-blue-100 mb-1 text-sm font-medium">
                    <Droplets className="w-4 h-4" /> {t('weather.humidity')}
                  </div>
                  <p className="font-bold text-xl">{weather?.humidity_pct || 65}%</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-blue-100 mb-1 text-sm font-medium">
                    <Wind className="w-4 h-4" /> {t('weather.wind')}
                  </div>
                  <p className="font-bold text-xl">{Math.round(weather?.wind_speed_kmh || 12)} km/h</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-blue-100 mb-1 text-sm font-medium">
                    <Sun className="w-4 h-4" /> UV Index
                  </div>
                  <p className="font-bold text-xl">{weather?.uv_index || 5} <span className="text-xs font-normal text-amber-200">({(weather?.uv_index || 5) > 6 ? 'High' : 'Moderate'})</span></p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 7-Day Forecast */}
          <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <CalendarDays className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">7-Day Forecast</h2>
            </div>
            
            <div className="flex justify-between overflow-x-auto pb-4 gap-4 hide-scrollbar">
              {MOCK_FORECAST.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-3 min-w-[60px]">
                  <span className="text-sm font-bold text-gray-500">{day.day}</span>
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center bg-gray-50 ${day.color}`}>
                    <day.icon className="h-6 w-6" />
                  </div>
                  <span className="font-black text-gray-900 text-lg">{day.temp}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${day.risk === 'High' ? 'text-rose-500' : day.risk === 'Med' ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {day.risk} Risk
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Alerts & Recommendations */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Smart Recommendations */}
          <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white h-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Agricultural Alerts
              </h2>

              <div className="space-y-4">
                {/* Spraying Advice */}
                <div className={`p-5 rounded-2xl border flex gap-4 ${weather?.spray_safe ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                  <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${weather?.spray_safe ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {weather?.spray_safe ? <CheckCircle2 className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className={`font-bold ${weather?.spray_safe ? 'text-emerald-900' : 'text-rose-900'}`}>
                      {weather?.spray_safe ? "Optimal Spraying Window" : "Spraying Not Recommended"}
                    </h3>
                    <p className={`text-sm mt-1 leading-relaxed ${weather?.spray_safe ? 'text-emerald-800' : 'text-rose-800'}`}>
                      {weather?.spray_advisory}
                    </p>
                  </div>
                </div>

                {/* Disease Risk Warning */}
                {(weather?.fungal_risk_score > 50) && (
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4">
                    <div className="shrink-0 h-10 w-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-900">Elevated Fungal Risk</h3>
                      <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                        Humidity of {weather?.humidity_pct}% increases the risk of Blight and mildew spreading.
                      </p>
                    </div>
                  </div>
                )}

                {/* Irrigation Recommendation */}
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
    </>
  );
}
