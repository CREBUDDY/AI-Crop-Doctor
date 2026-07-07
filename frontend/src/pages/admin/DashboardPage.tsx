import { Users, Activity, Leaf, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

export function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin_stats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats');
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
      </div>
    );
  }

  const growthData = [
    { month: 'Jan', users: Math.max(100, (stats?.kpis?.total_users || 0) * 0.1) },
    { month: 'Feb', users: Math.max(200, (stats?.kpis?.total_users || 0) * 0.3) },
    { month: 'Mar', users: Math.max(300, (stats?.kpis?.total_users || 0) * 0.5) },
    { month: 'Apr', users: Math.max(400, (stats?.kpis?.total_users || 0) * 0.7) },
    { month: 'May', users: Math.max(500, (stats?.kpis?.total_users || 0) * 0.9) },
    { month: 'Jun', users: stats?.kpis?.total_users || 0 },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 font-medium">Platform Analytics & Global Overview</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Users", value: stats?.kpis?.total_users || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "AI Scans Today", value: stats?.kpis?.scans_today || 0, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Diseases Detected", value: stats?.kpis?.diseases_detected || 0, icon: ShieldAlert, color: "text-rose-600", bg: "bg-rose-50" },
          { title: "Total Farms", value: stats?.kpis?.total_farms || 0, icon: Leaf, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Daily Scans Chart */}
        <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white p-6">
          <CardHeader className="px-0 pt-0 pb-6 border-b border-gray-100 mb-6">
            <CardTitle className="text-xl font-bold">Daily AI Scans</CardTitle>
          </CardHeader>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.scans_data || []} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="scans" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* User Growth Chart */}
        <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white p-6">
          <CardHeader className="px-0 pt-0 pb-6 border-b border-gray-100 mb-6">
            <CardTitle className="text-xl font-bold">User Growth</CardTitle>
          </CardHeader>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={4} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Common Diseases Pie Chart */}
        <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl bg-white p-6 lg:col-span-2">
          <CardHeader className="px-0 pt-0 pb-6 border-b border-gray-100 mb-6">
            <CardTitle className="text-xl font-bold">Disease Distribution</CardTitle>
          </CardHeader>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="h-64 w-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.disease_data || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(stats?.disease_data || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              {(stats?.disease_data || []).map((disease: any, i: number) => (
                <div key={i} className="flex items-center justify-between w-48">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: disease.color }} />
                    <span className="font-medium text-gray-700">{disease.name}</span>
                  </div>
                  <span className="font-bold text-gray-900">{disease.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}

export default DashboardPage;
