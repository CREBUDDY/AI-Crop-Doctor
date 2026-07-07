import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { 
  Camera, 
  CloudSun, 
  History, 
  PhoneCall, 
  CheckCircle2, 
  Circle, 
  ThermometerSun, 
  Droplets, 
  AlertTriangle,
  ChevronRight,
  Activity,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useAuthStore } from "../../lib/useAuthStore";
import { DemoBanner } from "../../components/ui/demo-banner";
import { useTranslation } from "react-i18next";

const MOCK_LATEST_SCAN = {
  overall_severity: 'critical',
  health_score: 45,
  created_at: new Date().toISOString(),
  crop: 'Tomato',
  disease: 'Early Blight'
};

export function DashboardPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  
  const { data: history = [], isLoading } = useQuery({
    queryKey: ['crop-history'],
    queryFn: async () => {
      const res = await api.get('/analyze/history/list');
      return res.data;
    },
    enabled: !!user
  });

  const latestScan = user ? (history.length > 0 ? history[0] : null) : MOCK_LATEST_SCAN;

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      {!user && <DemoBanner />}
      <div className="space-y-6 lg:space-y-8 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{t('dashboard.title')}</h1>
            <p className="text-gray-500 mt-1">{t('dashboard.subtitle')}</p>
          </div>
        </div>

      {/* Farm Overview Card */}
      <Card className="overflow-hidden border-0 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl bg-white">
        <div className="flex flex-col md:flex-row">
          
          {/* Left Side: Score & Crop */}
          <div className="md:w-1/3 bg-gradient-to-br from-primary-900 to-primary-950 p-8 text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=600&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay" />
            <div className="relative z-10">
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold tracking-wider uppercase backdrop-blur-md mb-4 inline-block">
                Tomato Field A
              </span>
              
              {/* Circular Progress Placeholder */}
              <div className="relative w-40 h-40 mx-auto my-4 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="currentColor" strokeWidth="3"
                  />
                  <path
                    className="text-primary-400"
                    strokeDasharray="85, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="currentColor" strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-4xl font-extrabold text-white">{latestScan?.health_score || '--'}</span>
                  <span className="text-xs font-medium text-primary-200">{t('dashboard.healthScore')}</span>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-primary-200">
                <Activity className="h-4 w-4" />
                <span className="text-sm font-medium">{latestScan ? (latestScan.overall_severity === 'none' ? 'Crop is healthy' : 'Disease Detected') : 'No scans yet'}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Status Metrics */}
          <div className="md:w-2/3 p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
            <div className={`flex gap-4 p-4 rounded-2xl border ${latestScan?.overall_severity === 'critical' ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${latestScan?.overall_severity === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {latestScan?.overall_severity === 'critical' ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
              </div>
              <div>
                <h3 className={`text-sm font-semibold uppercase tracking-wide mb-1 ${latestScan?.overall_severity === 'critical' ? 'text-rose-900' : 'text-emerald-900'}`}>Disease Risk</h3>
                <p className={`font-bold ${latestScan?.overall_severity === 'critical' ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {latestScan?.overall_severity === 'none' ? 'Low' : latestScan?.overall_severity || 'Unknown'}
                </p>
                <p className={`text-xs mt-1 ${latestScan?.overall_severity === 'critical' ? 'text-rose-600/80' : 'text-emerald-600/80'}`}>
                  {latestScan ? new Date(latestScan.created_at).toLocaleDateString() : 'No data'}
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Droplets className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-1">Water Status</h3>
                <p className="font-bold text-blue-700">Optimal Soil Moisture</p>
                <p className="text-xs text-blue-600/80 mt-1">Last watered yesterday</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <ThermometerSun className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wide mb-1">Weather</h3>
                <p className="font-bold text-amber-700">32°C • Sunny</p>
                <p className="text-xs text-amber-600/80 mt-1">High UV Index today</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-primary-50 border border-primary-100 sm:col-span-2 lg:col-span-1">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <ArrowRight className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-primary-900 uppercase tracking-wide mb-1">Next Action</h3>
                <p className="font-bold text-primary-700">Apply Fungicide (Mancozeb)</p>
                <p className="text-xs text-primary-600/80 mt-1">Recommended before 10 AM tomorrow</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to={user ? "/analyze" : "/login"}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-4 p-6 rounded-3xl bg-gradient-to-br from-primary-500 to-emerald-700 text-white shadow-lg shadow-primary-500/20 cursor-pointer border border-primary-400">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                  <Camera className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Analyze Crop</h3>
                  <p className="text-primary-100 text-sm">AI Disease & Pest Check</p>
                </div>
              </motion.div>
            </Link>

            <Link to="/weather">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-4 p-6 rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer group">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <CloudSun className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">Weather</h3>
                  <p className="text-gray-500 text-sm">7-Day Forecast & Alerts</p>
                </div>
              </motion.div>
            </Link>

            <Link to="/history">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-4 p-6 rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer group">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <History className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition-colors">History</h3>
                  <p className="text-gray-500 text-sm">Past Reports & Scans</p>
                </div>
              </motion.div>
            </Link>

            <Link to="/contact">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center gap-4 p-6 rounded-3xl bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer group">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <PhoneCall className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-amber-600 transition-colors">Expert Help</h3>
                  <p className="text-gray-500 text-sm">Connect with Agronomists</p>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>

        {/* Right Column: Today's Tasks */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Today's Tasks</h2>
            <Link to="/tasks" className="text-sm font-medium text-primary-600 hover:underline">View All</Link>
          </div>
          
          <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {[
                  { title: "Spray Fungicide (Mancozeb)", time: "Today, 5:00 PM", type: "urgent", done: false },
                  { title: "Monitor Field A (Early Blight)", time: "Today", type: "monitor", done: true },
                  { title: "Watering Scheduled", time: "In 2 Days", type: "info", done: false },
                  { title: "Heavy Rain Expected", time: "Tomorrow", type: "alert", done: false }
                ].map((task, i) => (
                  <div key={i} className={`flex items-start gap-4 p-5 transition-colors hover:bg-gray-50 ${task.done ? 'opacity-60' : ''}`}>
                    <button className="mt-0.5 shrink-0 text-gray-400 hover:text-primary-600 transition-colors">
                      {task.done ? <CheckCircle2 className="h-6 w-6 text-primary-500" /> : <Circle className="h-6 w-6" />}
                    </button>
                    <div className="flex-1">
                      <p className={`font-medium ${task.done ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {task.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{task.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
    </>
  );
}
