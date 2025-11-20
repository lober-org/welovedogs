export const getProfileRoute = (type: string) => {
  const normalizedType = type.toLowerCase();
  if (normalizedType === "veterinarian") return "veterinary";
  return normalizedType;
};

export const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const iconMap: Record<string, string> = {
  Surgery: "🏥",
  Medication: "💊",
  Therapy: "🩺",
  Food: "🍖",
  Tests: "🔬",
  ICU: "⚕️",
  Rehabilitation: "♿",
  Treatment: "💉",
  Extraction: "🦷",
  Care: "❤️",
};

export const formatCurrency = (amount: number, isLoading = false) => {
  if (isLoading) return "...";
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
