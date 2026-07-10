import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./navbar";
import { BottomNav } from "./bottom-nav";

export function MainLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {!isAuthPage && <Navbar />}
      
      <main className="flex-1 pt-16 pb-20 md:pb-0 relative overflow-x-hidden">
        <div className="h-full animate-in fade-in duration-300">
          <Outlet />
        </div>
      </main>

      {!isAuthPage && <BottomNav />}
    </div>
  );
}
