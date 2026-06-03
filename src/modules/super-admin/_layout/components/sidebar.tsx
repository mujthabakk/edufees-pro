"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Building2, CreditCard, BarChart3, Settings, Shield, LogOut, Bell, FileText } from "lucide-react";

const nav = [
  { label: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
  { label: "Schools", href: "/super-admin/schools", icon: Building2 },
  { label: "Subscriptions", href: "/super-admin/subscriptions", icon: CreditCard },
  { label: "Analytics", href: "/super-admin/analytics", icon: BarChart3 },
  { label: "Audit Logs", href: "/super-admin/audit", icon: FileText },
  { label: "Notifications", href: "/super-admin/notifications", icon: Bell },
  { label: "Settings", href: "/super-admin/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-purple-950 flex flex-col z-10">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-purple-900">
        <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">EduFees Pro</p>
          <p className="text-purple-400 text-xs">Super Admin Portal</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", active ? "bg-purple-600 text-white" : "text-purple-300 hover:text-white hover:bg-purple-900")}>
              <Icon className="w-[18px] h-[18px] shrink-0" />{label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-purple-900 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">SA</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium">Super Admin</p>
            <p className="text-purple-400 text-xs truncate">superadmin@edufees.pro</p>
          </div>
        </div>
        <button onClick={() => router.push("/")} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-purple-300 hover:text-white hover:bg-purple-900 w-full transition-colors">
          <LogOut className="w-[18px] h-[18px] shrink-0" />Sign Out
        </button>
      </div>
    </aside>
  );
}
