import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuthStore } from "../../lib/useAuthStore";
import { DemoBanner } from "../../components/ui/demo-banner";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Leaf, 
  Droplets,
  Calendar,
  Activity,
  ChevronLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useTranslation } from 'react-i18next';

const MOCK_HISTORY = [
  {
    id: "demo-1",
    crop: "Tomato",
    disease: "Early Blight",
    overall_severity: "critical",
    health_score: 45,
    created_at: new Date().toISOString()
  },
  {
    id: "demo-2",
    crop: "Cotton",
    disease: "Healthy",
    overall_severity: "none",
    health_score: 95,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "demo-3",
    crop: "Wheat",
    disease: "Leaf Rust",
    overall_severity: "moderate",
    health_score: 70,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

export function CropHistoryPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const { data: realHistory, isLoading } = useQuery({
    queryKey: ['crop-history'],
    queryFn: async () => {
      const res = await api.get('/analyze/history/list');
      return res.data;
    },
    enabled: !!user
  });

  const history = user ? (realHistory || []) : MOCK_HISTORY;

  // Map history to chart data
  const healthData = history.map((item: any) => ({
    date: new Date(item.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
    score: item.health_score || 0
  })).reverse(); // Oldest first for chart

  // Map history to timeline events
  const timelineEvents = history.map((item: any) => ({
    id: item.id,
    date: new Date(item.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
    title: item.overall_severity === 'none' ? 'Crop Appears Healthy' : 'Disease Detected',
    desc: `Health Score: ${item.health_score || 0}/100. Severity: ${item.overall_severity || 'Unknown'}`,
    icon: item.overall_severity === 'none' ? CheckCircle2 : AlertTriangle,
    color: item.overall_severity === 'none' ? "text-emerald-500" : "text-rose-500",
    bg: item.overall_severity === 'none' ? "bg-emerald-100" : "bg-rose-100",
  }));

  if (isLoading && user) {
    return (
      <div className="container mx-auto p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      {!user && <DemoBanner />}
      <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-5xl pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{t('history.title')}</h1>
              <p className="text-gray-500 font-medium">{t('history.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Column: Health Chart */}
          <div className="space-y-6">
            <Card className="p-6 rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
                  <Activity className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Health Score Trend</h2>
              </div>
              
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={healthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }} 
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#10b981" 
                      strokeWidth={4}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Right Column: Vertical Timeline */}
          <div>
            <Card className="p-6 rounded-3xl border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Lifecycle Events</h2>
              </div>

              <div className="relative pl-6 border-l-2 border-gray-100 space-y-8 ml-4">
                {timelineEvents.map((event: any, i: number) => (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    className="relative"
                  >
                    <div className={`absolute -left-[45px] top-1 h-10 w-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${event.bg} ${event.color}`}>
                      <event.icon className="h-5 w-5" />
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 hover:bg-white hover:border-gray-200 hover:shadow-md transition-all">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{event.date}</span>
                      <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2">{event.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{event.desc}</p>
                      <Link to={`/report?id=${event.id}`} className="inline-block mt-3 text-sm font-semibold text-primary-600 hover:underline">View Full Report &rarr;</Link>
                    </div>
                  </motion.div>
                ))}
                
                {timelineEvents.length === 0 && (
                  <div className="text-gray-500">No crop history found. Analyze a crop to see it here!</div>
                )}
              </div>
            </Card>
          </div>

        </div>
      </div>
    </>
  );
}
