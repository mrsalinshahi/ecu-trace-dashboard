import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  ClipboardList,
  Activity,
  Cpu,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/upload", icon: Upload, label: "Upload Trace" },
  { to: "/test-runs", icon: ClipboardList, label: "Test Runs" },
];

export function Sidebar() {
  return (
    <aside className="w-60 flex-shrink-0 flex flex-col bg-slate-900 border-r border-slate-800 h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="p-2 bg-brand-600/20 rounded-lg">
          <Cpu className="w-5 h-5 text-brand-400" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-100">ECU Trace</div>
          <div className="text-xs text-slate-500">Dashboard</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-600/20 text-brand-400 border border-brand-500/20"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400" />
          <span className="text-xs text-slate-500">API Connected</span>
        </div>
        <div className="text-xs text-slate-600 mt-1">v1.0.0</div>
      </div>
    </aside>
  );
}
