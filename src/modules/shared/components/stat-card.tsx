import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export function StatCard({ title, value, change, changeType, icon: Icon, iconColor, iconBg }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={cn(
              "text-xs mt-1 font-medium",
              changeType === "up" ? "text-green-600" : changeType === "down" ? "text-red-600" : "text-gray-500"
            )}>
              {change}
            </p>
          )}
        </div>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", iconBg)}>
          <Icon className={cn("w-6 h-6", iconColor)} />
        </div>
      </div>
    </div>
  );
}
