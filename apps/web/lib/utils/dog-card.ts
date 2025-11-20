import type { RequesterType } from "./dog-cards";
import { getCareProviderProfileUrl } from "./dog-cards";

/**
 * Gets badge color class for rescuer type
 */
export const getRescuerBadgeColor = (type: RequesterType | string): string => {
  const normalized = type.toLowerCase();
  switch (normalized) {
    case "shelter":
      return "bg-blue-500/90 text-white hover:bg-blue-600/90";
    case "veterinary":
    case "veterinarian":
      return "bg-green-500/90 text-white hover:bg-green-600/90";
    case "rescuer":
      return "bg-orange-500/90 text-white hover:bg-orange-600/90";
    default:
      return "bg-gray-500/90 text-white";
  }
};

/**
 * Gets profile URL for a rescuer/care provider
 */
export const getRescuerProfileUrl = (type: RequesterType | string, id: string | number): string => {
  const normalized = type.toLowerCase();
  const routeType =
    normalized === "veterinary" || normalized === "veterinarian" ? "veterinary" : normalized;
  return `/profile/${routeType}/${id}`;
};

/**
 * Formats currency for display
 */
export const formatCurrencyDisplay = (amount: number): string => {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};
