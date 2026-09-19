import { useAuth } from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Users,
  Activity,
  LogOut,
  Layers,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, role: "all" },
  { to: "/projects", label: "Projects", icon: FolderOpen, role: "all" },
  { to: "/tasks", label: "My Tasks", icon: CheckSquare, role: "dev" },
  { to: "/users", label: "Users", icon: Users, role: "admin" },
  { to: "/activity", label: "Activity", icon: Activity, role: "all" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const filtered = navItems.filter((item) => {
    if (item.role === "all") return true;
    if (item.role === "dev" && user?.role === "DEVELOPER") return true;
    if (item.role === "admin" && user?.role === "ADMIN") return true;
    return false;
  });

  return (
    <aside className="flex flex-col h-screen w-64 bg-holst-navy-800 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="w-9 h-9 rounded-xl bg-holst-blue flex items-center justify-center">
          <Layers className="w-5 h-5 text-holst-cream" />
        </div>
        <span className="font-display text-xl font-semibold text-holst-cream tracking-wide">
          Nexus
        </span>
      </div>

      {/* User profile card */}
      {user && (
        <div className="mx-4 mt-2 mb-4 px-4 py-4 rounded-2xl neu-dark-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-holst-blue flex items-center justify-center text-holst-cream font-body font-bold text-sm shrink-0">
              {user.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="font-body text-sm font-medium text-holst-cream truncate">
                {user.name}
              </p>
              <p className="font-accent text-xs text-holst-sage capitalize">
                {user.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-3 mt-2">
        {filtered.map((item) => {
          const isActive = item.to === "/dashboard"
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-xl font-body text-sm transition-all duration-200
                ${
                  isActive
                    ? "neu-dark text-holst-sand border-l-[3px] border-holst-sand"
                    : "text-holst-sage hover:text-holst-cream hover:bg-white/5"
                }
              `}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-5 mt-auto">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl font-body text-sm text-holst-sage hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
