import { motion } from "framer-motion";
import { Droplets, AlertTriangle, CloudRain, CheckCircle2, ShieldAlert } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

export function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: "disease_alert",
      title: "Critical: Early Blight Detected",
      desc: "High severity early blight detected on Tomato Field A. Immediate fungicide application recommended to prevent spread.",
      time: "2 hours ago",
      icon: ShieldAlert,
      color: "text-white",
      bg: "bg-rose-500",
      cardBorder: "border-rose-200",
      cardBg: "bg-rose-50/50",
      unread: true,
      tag: "🔴 High Risk"
    },
    {
      id: 2,
      type: "spray_reminder",
      title: "Action Required: Spray Schedule",
      desc: "It is time for your scheduled Mancozeb spray on Tomato Field A. Weather conditions are currently optimal.",
      time: "5 hours ago",
      icon: Droplets,
      color: "text-white",
      bg: "bg-primary-500",
      cardBorder: "border-primary-200",
      cardBg: "bg-primary-50/50",
      unread: true,
      tag: "🟢 Spray Today"
    },
    {
      id: 3,
      type: "weather_alert",
      title: "Weather Alert: Heavy Rain",
      desc: "Heavy rainfall expected tomorrow. Pause any planned spraying to avoid chemical runoff.",
      time: "Yesterday",
      icon: CloudRain,
      color: "text-amber-600",
      bg: "bg-amber-100",
      cardBorder: "border-amber-100",
      cardBg: "bg-white",
      unread: false,
      tag: "🟡 Weather Warning"
    }
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 pb-24 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">You have <span className="font-bold text-primary-600">2 unread</span> alerts requiring attention.</p>
        </div>
        <Button variant="outline" className="bg-white border-gray-200 shadow-sm shrink-0">
          <CheckCircle2 className="mr-2 h-4 w-4 text-gray-500" />
          Mark all as read
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.map((notif, i) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          >
            <Card className={`p-6 flex flex-col sm:flex-row gap-5 border shadow-sm rounded-3xl transition-colors ${notif.cardBorder} ${notif.cardBg} hover:shadow-md cursor-pointer`}>
              {/* Icon */}
              <div className={`shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${notif.bg} ${notif.color}`}>
                <notif.icon className="h-7 w-7" />
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-white/60 backdrop-blur-sm border border-black/5 mb-2">
                      {notif.tag}
                    </span>
                    <h3 className={`text-lg font-bold ${notif.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notif.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">{notif.time}</span>
                    {notif.unread && <span className="h-2.5 w-2.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {notif.desc}
                </p>
                {notif.unread && (
                  <div className="mt-4 flex gap-3">
                    <Button size="sm" className="bg-white text-gray-900 border border-gray-200 hover:bg-gray-50">
                      View Details
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
