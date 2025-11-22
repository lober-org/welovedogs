import { getSocialIcon, getSocialColor } from "./utils";

interface SocialMediaIconsProps {
  socialMedia: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    youtube?: string;
    twitter?: string;
  };
}

export function SocialMediaIcons({ socialMedia }: SocialMediaIconsProps) {
  return (
    <div className="flex gap-2">
      {Object.entries(socialMedia).map(([platform]) => (
        <div
          key={platform}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${getSocialColor(platform)}`}
        >
          {getSocialIcon(platform)}
        </div>
      ))}
    </div>
  );
}
