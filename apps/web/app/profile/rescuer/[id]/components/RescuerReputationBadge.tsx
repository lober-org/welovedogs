import { Sparkles } from "lucide-react";

interface RescuerReputationBadgeProps {
  reputation: number;
}

export function RescuerReputationBadge({ reputation }: RescuerReputationBadgeProps) {
  return (
    <div className="bg-gradient-to-r from-purple-200 via-purple-100 to-yellow-100 rounded-lg p-3 border border-purple-300">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-700 mb-1">Rescuer Reputation</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/80 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-yellow-400 transition-all duration-500"
                style={{ width: `${Math.min((reputation / 1000) * 100, 100)}%` }}
              />
            </div>
            <span className="text-xs font-bold text-gray-800">{reputation}/1000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
