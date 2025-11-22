import { Heart, Trophy, TrendingUp, Star, Clock } from "lucide-react";
import type { Rescuer } from "../types";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-white/60 rounded-lg p-3 border border-purple-200">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface RescuerStatsProps {
  rescuer: Pick<
    Rescuer,
    | "dogsHelped"
    | "campaignsCompleted"
    | "totalReceived"
    | "rating"
    | "updatesOnTime"
    | "totalUpdates"
  >;
}

export function RescuerStats({ rescuer }: RescuerStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
      <StatCard
        icon={<Heart className="h-4 w-4 text-purple-600" />}
        label="Dogs Helped"
        value={rescuer.dogsHelped}
      />
      <StatCard
        icon={<Trophy className="h-4 w-4 text-yellow-600" />}
        label="Campaigns"
        value={rescuer.campaignsCompleted}
      />
      <StatCard
        icon={<TrendingUp className="h-4 w-4 text-green-600" />}
        label="Total Raised"
        value={`$${(rescuer.totalReceived / 1000).toFixed(1)}k`}
      />
      <StatCard
        icon={<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
        label="Rating"
        value={rescuer.rating.toFixed(1)}
      />
      <StatCard
        icon={<Clock className="h-4 w-4 text-blue-600" />}
        label="Updates On Time"
        value={`${rescuer.updatesOnTime}/${rescuer.totalUpdates}`}
      />
    </div>
  );
}
