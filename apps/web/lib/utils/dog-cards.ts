export type RequesterType = "Shelter" | "Veterinary" | "Rescuer";

export type SortOption = "urgency" | "lessFunded" | "recent";

export interface DogFilter {
  requesterType: string;
  sortBy: SortOption;
}

/**
 * Normalizes requester type to a standard format
 */
export const normalizeRescuedBy = (type: string): RequesterType => {
  const normalized = type.toLowerCase();
  if (normalized === "veterinarian" || normalized === "veterinary") {
    return "Veterinary";
  }
  if (normalized === "shelter") {
    return "Shelter";
  }
  if (normalized === "rescuer") {
    return "Rescuer";
  }
  // Default fallback
  return "Rescuer";
};

/**
 * Filters dogs by requester type
 */
export const filterDogsByRequester = <T extends { requester_type: string }>(
  dogs: T[],
  requesterFilter: string
): T[] => {
  if (requesterFilter === "all") return dogs;
  return dogs.filter((dog) => dog.requester_type === requesterFilter);
};

/**
 * Sorts dogs based on the selected sort option
 */
export const sortDogs = <
  T extends {
    campaigns?: Array<{ raised?: number; goal?: number }>;
    created_at: string;
  },
>(
  dogs: T[],
  sortBy: SortOption
): T[] => {
  return [...dogs].sort((a, b) => {
    switch (sortBy) {
      case "urgency":
      case "lessFunded":
        const raisedA = a.campaigns?.[0]?.raised || 0;
        const raisedB = b.campaigns?.[0]?.raised || 0;
        return raisedA - raisedB;
      case "recent":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });
};

/**
 * Filters and sorts dogs in one operation
 */
export const filterAndSortDogs = <
  T extends {
    requester_type: string;
    campaigns?: Array<{ raised?: number; goal?: number }>;
    created_at: string;
  },
>(
  dogs: T[],
  filter: DogFilter
): T[] => {
  const filtered = filterDogsByRequester(dogs, filter.requesterType);
  return sortDogs(filtered, filter.sortBy);
};

/**
 * Formats currency amount
 */
export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Gets profile URL for a care provider
 */
export const getCareProviderProfileUrl = (type: RequesterType, id: string | number): string => {
  const normalizedType = type.toLowerCase();
  const routeType = normalizedType === "veterinary" ? "veterinary" : normalizedType;
  return `/profile/${routeType}/${id}`;
};
