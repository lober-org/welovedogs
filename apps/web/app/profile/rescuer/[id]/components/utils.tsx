import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

export const getSocialIcon = (platform: string) => {
  switch (platform) {
    case "instagram":
      return <Instagram className="h-5 w-5" />;
    case "facebook":
      return <Facebook className="h-5 w-5" />;
    case "twitter":
      return <Twitter className="h-5 w-5" />;
    case "youtube":
      return <Youtube className="h-5 w-5" />;
    case "tiktok":
      return <span className="text-xs font-bold">TT</span>;
    default:
      return null;
  }
};

export const getSocialColor = (platform: string) => {
  switch (platform) {
    case "instagram":
      return "bg-gradient-to-br from-purple-600 to-pink-600";
    case "facebook":
      return "bg-blue-600";
    case "twitter":
      return "bg-sky-500";
    case "youtube":
      return "bg-red-600";
    case "tiktok":
      return "bg-black";
    default:
      return "bg-gray-600";
  }
};

export const getLevelClasses = (color: string) => {
  const colorMap: Record<string, { bg: string; text: string; border: string; icon: string }> = {
    yellow: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      border: "border-yellow-300",
      icon: "text-yellow-600",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-700",
      border: "border-purple-300",
      icon: "text-purple-600",
    },
    blue: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-300",
      icon: "text-blue-600",
    },
    green: {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-300",
      icon: "text-green-600",
    },
    gray: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      border: "border-gray-300",
      icon: "text-gray-600",
    },
  };
  return colorMap[color] || colorMap.gray;
};
