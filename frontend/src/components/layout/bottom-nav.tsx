import { NavLink } from "react-router-dom";
import { Home, ScanLine, History, CloudRain, Bell, User } from "lucide-react";
import { cn } from "../../lib/utils";

export function BottomNav() {
  const navItems = [
    { name: "Home", to: "/dashboard", icon: Home },
    { name: "History", to: "/history", icon: History },
    { name: "Scan", to: "/analyze", icon: ScanLine, special: true },
    { name: "Weather", to: "/weather", icon: CloudRain },
    { name: "Profile", to: "/profile", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 px-6 pb-safe flex items-center justify-between z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center w-12 transition-colors",
              isActive ? "text-primary-600" : "text-gray-400 hover:text-gray-600"
            )
          }
        >
          {({ isActive }) =>
            item.special ? (
              <div className="absolute bottom-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/40">
                <item.icon className="h-6 w-6" />
              </div>
            ) : (
              <>
                <item.icon
                  className={cn("h-6 w-6 mb-1", isActive && "fill-primary-50")}
                />
                <span className="text-[10px] font-medium">{item.name}</span>
              </>
            )
          }
        </NavLink>
      ))}
    </div>
  );
}
