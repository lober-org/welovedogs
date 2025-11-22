import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Cause } from "../types";

interface DogCardProps {
  cause: Cause;
  variant?: "desktop" | "mobile";
}

export function DogCard({ cause, variant = "desktop" }: DogCardProps) {
  const router = useRouter();

  const baseClasses =
    variant === "desktop"
      ? "group rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm hover:shadow-md transition-all hover:border-purple-400 cursor-pointer"
      : "rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm cursor-pointer";

  return (
    <div onClick={() => router.push(`/donate/${cause.dogId}`)} className={baseClasses}>
      <div className="relative w-full h-48 rounded-lg mb-3 overflow-hidden">
        <Image
          src={cause.dogImage || "/placeholder.svg"}
          alt={cause.dogName}
          fill
          className="object-cover"
        />
      </div>
      <h3 className="font-sans text-lg font-bold text-gray-900 mb-2">{cause.dogName}</h3>
      <p className="text-sm text-gray-700 mb-4">Help {cause.dogName} get the care they need</p>
      <button
        type="button"
        className="w-full rounded-lg bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-purple-900 px-4 py-2 text-sm font-semibold hover:from-yellow-300 hover:via-yellow-200 hover:to-yellow-300 transition-all pointer-events-none"
      >
        Donate Now
      </button>
    </div>
  );
}
