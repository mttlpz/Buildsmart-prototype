import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, FolderOpen, FileSpreadsheet, Tag, Truck, Users, Settings } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/quotation" },
  { label: "Blueprints", icon: FileText, href: "/blueprints" },
  { label: "Projects", icon: FolderOpen, href: "/projects" },
  { label: "Quotations", icon: FileSpreadsheet, href: "/quotations" },
];

const settingsItems = [
  { label: "Pricelist", icon: Tag, href: "/pricelist" },
  { label: "Suppliers", icon: Truck, href: "/suppliers" },
  { label: "Management", icon: Users, href: "/management" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="flex h-screen w-[160px] flex-shrink-0 flex-col bg-white shadow-[2px_0_8px_rgba(0,0,0,0.08)]">
      <div className="flex h-16 items-center justify-center border-b border-gray-100 px-3">
        <img src="/figmaAssets/logo.svg" alt="BuildSmart" className="h-8 w-auto" />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location === item.href || (item.href === "/quotation" && location === "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`nav-${item.label.toLowerCase()}`}
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
        })}

        <div className="mt-4 px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Settings
        </div>

        {settingsItems.map((item) => {
          const Icon = item.icon;
          const active = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`nav-${item.label.toLowerCase()}`}
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
        })}
      </nav>
    </aside>
  );
}
