import { Award } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DonorBadgesProps {
  badges: number;
}

export function DonorBadges({ badges }: DonorBadgesProps) {
  if (badges === 0) return null;

  const badgeConfigs = [
    {
      level: 1,
      emoji: "🎯",
      label: "First Donation",
      colors: "from-green-50 to-emerald-50",
      iconColors: "from-green-400 to-emerald-500",
    },
    {
      level: 2,
      emoji: "💝",
      label: "Generous Supporter",
      colors: "from-blue-50 to-cyan-50",
      iconColors: "from-blue-400 to-cyan-500",
    },
    {
      level: 3,
      emoji: "🔄",
      label: "Consistent Helper",
      colors: "from-purple-50 to-pink-50",
      iconColors: "from-purple-400 to-pink-500",
    },
    {
      level: 4,
      emoji: "🌱",
      label: "Growing Supporter",
      colors: "from-orange-50 to-amber-50",
      iconColors: "from-orange-400 to-amber-500",
    },
    {
      level: 5,
      emoji: "💖",
      label: "Big-Hearted Donor",
      colors: "from-red-50 to-rose-50",
      iconColors: "from-red-400 to-rose-500",
    },
    {
      level: 6,
      emoji: "⭐",
      label: "Steady Contributor",
      colors: "from-indigo-50 to-violet-50",
      iconColors: "from-indigo-400 to-violet-500",
    },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 transition-all hover:scale-110 shadow-sm">
          <Award className="h-3 w-3 text-white" />
          {badges > 1 && (
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-purple-600 text-[8px] font-bold text-white">
              {badges}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b pb-2">
            <Award className="h-5 w-5 text-amber-500" />
            <h4 className="font-bold text-foreground">Donor Badges</h4>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {badgeConfigs.map((config) => {
              if (badges < config.level) return null;
              return (
                <div
                  key={config.level}
                  className={`flex flex-col items-center gap-1 rounded-lg border bg-gradient-to-br ${config.colors} p-2`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${config.iconColors} text-white shadow-md`}
                  >
                    {config.emoji}
                  </div>
                  <span className="text-[10px] font-medium text-center leading-tight">
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
