import { Shield, Zap } from "lucide-react";
import { iconMap, formatCurrency } from "./utils";
import type { Dog } from "./types";

interface CampaignStatusCardProps {
  dog: Dog;
  totalRaised: number;
  escrowDonations: number;
  instantDonations: number;
  isLoadingDonations: boolean;
  escrowContractId: string | null;
  stellarAddressToUse: string | null;
}

export function CampaignStatusCard({
  dog,
  totalRaised,
  escrowDonations,
  instantDonations,
  isLoadingDonations,
  escrowContractId,
  stellarAddressToUse,
}: CampaignStatusCardProps) {
  if (dog.goal === 0) {
    return (
      <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-8 text-center">
        <p className="text-yellow-800 font-medium">
          This dog doesn't have an active fundraising campaign yet. Check back soon or contact the
          care provider for more information.
        </p>
      </div>
    );
  }

  const progressPercentage = Math.round((totalRaised / dog.goal) * 100);

  return (
    <div className="space-y-6">
      {/* Current Condition */}
      {dog.currentCondition && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold text-lg mb-3">Current Condition</h3>
          <p className="text-foreground/90 leading-relaxed">{dog.currentCondition}</p>
        </div>
      )}
      {/* Campaign Status Card */}
      <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-foreground">
            {dog.headline || `Help ${dog.name} Recover`}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Campaign Status: Active</p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Fundraising Progress</span>
            <span className="text-muted-foreground">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 rounded-lg bg-background/60">
            <div className="text-2xl font-bold text-foreground">
              ${formatCurrency(totalRaised, isLoadingDonations)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Total Raised</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-background/60">
            <div className="text-2xl font-bold text-foreground">${dog.goal.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">Goal</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-background/60">
            <div className="text-2xl font-bold text-foreground">
              ${formatCurrency(totalRaised - (dog.spent || 0))}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Remaining</div>
          </div>
        </div>

        {/* Escrow and Instant Breakdown */}
        {(escrowContractId || stellarAddressToUse) && (
          <div className="mt-4 rounded-lg border bg-background/40 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground mb-2">Breakdown</h4>
            {escrowContractId && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Escrow:
                </span>
                <span className="font-semibold text-foreground">
                  ${formatCurrency(escrowDonations, isLoadingDonations)}
                </span>
              </div>
            )}
            {stellarAddressToUse && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  Instant:
                </span>
                <span className="font-semibold text-foreground">
                  ${formatCurrency(instantDonations, isLoadingDonations)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Funds Needed For */}
      {dog.fundsNeededFor && dog.fundsNeededFor.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold text-lg mb-4">Funds Needed For:</h3>
          <div className="flex flex-wrap gap-2">
            {dog.fundsNeededFor.map((item: any, index: number) => {
              const itemKey = typeof item === "string" ? item : item.label || `item-${index}`;
              return (
                <div
                  key={itemKey}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border bg-background"
                >
                  <span className="text-lg">{iconMap[item.label] || iconMap[item] || "❤️"}</span>
                  <span className="text-sm font-medium">{item.label || item}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
