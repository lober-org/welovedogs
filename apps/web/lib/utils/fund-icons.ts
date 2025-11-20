/**
 * Maps fund category icons to emoji representations
 */
export function getIconEmoji(icon: string): string {
  const iconMap: Record<string, string> = {
    // Emergency & Surgery
    Emergency: "🚨",
    "Emergency Care": "🚨",
    Surgery: "🏥",
    ICU: "⚕️",

    // Medical Treatment
    Medication: "💊",
    Vaccination: "💉",
    Rehabilitation: "🦴",
    Treatment: "💉",
    Tests: "🔬",
    "Dental Care": "🦷",
    "Spay/Neuter": "⚕️",

    // Care & Support
    Food: "🍖",
    "Special Diet": "🍖",
    Care: "❤️",
    Therapy: "🩺",
    "Behavioral Training": "🐕",
    "Grooming / Hygiene": "✨",

    // Facility & Equipment
    "Shelter / Housing": "🏠",
    "Temporary Foster Care": "🏡",
    Transportation: "🚗",
    "Specialized Equipment": "🔧",

    // Specific Treatments
    "Post-Surgery Care": "🏥",
    "Pain Medication": "💊",
    "Physical Therapy": "🦴",
    Chemotherapy: "💉",
    "Oncology Tests": "🔬",
    "Pain Relief": "💊",
    "Dental Surgery": "🦷",
    Extraction: "🦷",
    Antibiotics: "💊",
    "Post-Op Care": "❤️",
    Supplements: "💊",
    "High-Quality Nutrition": "🍖",
    "Pain Management": "💊",
    "Recovery Care": "❤️",
    "Heartworm Medication": "💊",
    "Blood Tests": "🔬",
    "Nutritional Support": "🍖",
    "Tooth Extractions": "🦷",
    "Rehabilitation / Training": "🦴",

    // Default
    Other: "💝",
  };
  return iconMap[icon] || "❤️";
}
