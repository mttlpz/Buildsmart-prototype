import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, FolderOpen, FileSpreadsheet, Tag, Truck, Users, Settings, Lock, TrendingUp, LogOut } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard",   icon: LayoutDashboard, href: "/dashboard",  minStep: 2 },
  { label: "Blueprints",  icon: FileText,         href: "/blueprints", minStep: 2 },
  { label: "Projects",    icon: FolderOpen,       href: "/projects",   minStep: 2 },
  { label: "Quotations",  icon: FileSpreadsheet,  href: "/quotations", minStep: 2 },
];

const SETTINGS_ITEMS = [
  { label: "Pricelist",    icon: Tag,        href: "/pricelist",  minStep: 0 },
  { label: "Management",   icon: Users,      href: "/management", minStep: 1 },
  { label: "Market Intel", icon: TrendingUp, href: "/analysis",   minStep: 2 },
  { label: "Suppliers",    icon: Truck,      href: "/suppliers",  minStep: 2 },
  { label: "Settings",     icon: Settings,   href: "/settings",   minStep: 2 },
];

function NavItem({ item, onboardingStep }: { item: typeof NAV_ITEMS[0]; onboardingStep: number }) {
  const [location] = useLocation();
  const Icon = item.icon;
  const active = location === item.href || (item.href === "/dashboard" && location === "/");
  const locked = onboardingStep < item.minStep;

  if (locked) {
    return (
      <div
        className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-gray-300 cursor-not-allowed select-none"
        title={`Complete setup to unlock ${item.label}`}
      >
        <Lock className="h-4 w-4 flex-shrink-0" />
        <span>{item.label}</span>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
      className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-[#E07B39] text-white"
          : "text-gray-600 hover:bg-orange-50 hover:text-[#E07B39]"
      }`}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

export function Sidebar() {
  const { onboardingStep } = useApp();
  const { currentUser, logout } = useAuth();

  const initials = currentUser?.email
    ? currentUser.email.slice(0, 2).toUpperCase()
    : "BS";

  return (
    <aside className="flex h-screen w-[160px] flex-shrink-0 flex-col bg-white shadow-[2px_0_8px_rgba(0,0,0,0.08)]">
      <div className="flex h-16 items-center justify-center border-b border-gray-100 px-3">
        <img src="/figmaAssets/logo.svg" alt="BuildSmart" className="h-8 w-auto" />
      </div>

      {/* Onboarding progress */}
      {onboardingStep < 2 && (
        <div className="mx-2 mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-center">
          <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600">Setup {onboardingStep}/2</p>
          <div className="mt-1 flex gap-1">
            <div className={`h-1 flex-1 rounded-full ${onboardingStep >= 1 ? "bg-amber-500" : "bg-amber-200"}`} />
            <div className={`h-1 flex-1 rounded-full ${onboardingStep >= 2 ? "bg-amber-500" : "bg-amber-200"}`} />
          </div>
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-3">
        {NAV_ITEMS.map(item => (
          <NavItem key={item.href} item={item} onboardingStep={onboardingStep} />
        ))}

        <div className="mt-4 px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Settings
        </div>

        {SETTINGS_ITEMS.map(item => (
          <NavItem key={item.href} item={item} onboardingStep={onboardingStep} />
        ))}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-gray-100 px-2 py-2">
        <div className="flex items-center gap-2 rounded-lg px-2 py-2">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#E07B39] text-[10px] font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-semibold text-gray-700">
              {currentUser?.email?.split("@")[0] ?? "User"}
            </p>
            <p className="truncate text-[9px] text-gray-400">
              {onboardingStep >= 2 ? "✓ Active" : "Setting up…"}
            </p>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="flex-shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
            data-testid="button-logout"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
