import { Shield } from "lucide-react";
import { getLevelClasses } from "./utils";

interface RescuerLevelBadgeProps {
  level: {
    name: string;
    icon: string;
    color: string;
  };
  reputation: number;
}

export function RescuerLevelBadge({ level, reputation }: RescuerLevelBadgeProps) {
  const levelClasses = getLevelClasses(level.color);

  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-3xl">{level.icon}</span>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-bold px-3 py-1 rounded-full ${levelClasses.bg} ${levelClasses.text} border ${levelClasses.border}`}
            >
              {level.name}
            </span>
            <div className="flex items-center gap-1">
              <Shield className={`h-4 w-4 ${levelClasses.icon}`} />
              <span className="text-sm font-semibold text-gray-700">Reputation: {reputation}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
