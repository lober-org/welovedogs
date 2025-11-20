import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { MapPin, ExternalLink } from "lucide-react";
import { StarRating } from "./StarRating";
import { getProfileRoute } from "./utils";
import type { CareProvider } from "./types";

interface CareProviderCardProps {
  careProvider: CareProvider;
  variant?: "desktop" | "mobile";
}

export function CareProviderCard({ careProvider, variant = "desktop" }: CareProviderCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-lg md:p-8">
      <div className="mb-6 flex items-start gap-4 md:gap-6">
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-4 border-primary shadow-lg md:h-32 md:w-32">
          <Image
            src={careProvider.image || "/placeholder.svg"}
            alt={careProvider.name}
            fill
            className="object-cover"
          />
          {careProvider.rating && careProvider.rating >= 4.5 && (
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg border-2 border-white">
              <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="mb-1 font-sans text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
            {careProvider.name}
          </h3>
          <p className="mb-3 text-base text-primary font-semibold md:text-lg">
            {careProvider.type}
          </p>

          {careProvider.rating && <StarRating rating={careProvider.rating} size="md" showValue />}
        </div>
      </div>

      {(careProvider.description || careProvider.about) && (
        <div className="mb-6 p-4 rounded-lg bg-background/50">
          <h4 className="font-semibold text-lg mb-2 text-foreground">About</h4>
          <p className="text-pretty text-base leading-relaxed text-foreground/90">
            {careProvider.about || careProvider.description}
          </p>
        </div>
      )}

      <div
        className={`grid grid-cols-1 ${variant === "desktop" ? "md:grid-cols-2 gap-4" : "gap-3"} mb-6`}
      >
        {careProvider.location && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-muted-foreground mb-1">Location</div>
              <div className="text-base text-foreground">{careProvider.location}</div>
            </div>
          </div>
        )}

        {careProvider.email && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
            <svg
              className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <div>
              <div className="text-sm font-semibold text-muted-foreground mb-1">Email</div>
              <a
                href={`mailto:${careProvider.email}`}
                className={`text-base text-primary hover:underline ${variant === "mobile" ? "break-all" : ""}`}
              >
                {careProvider.email}
              </a>
            </div>
          </div>
        )}

        {careProvider.phone && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
            <svg
              className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <div>
              <div className="text-sm font-semibold text-muted-foreground mb-1">Phone</div>
              <a
                href={`tel:${careProvider.phone}`}
                className="text-base text-primary hover:underline"
              >
                {careProvider.phone}
              </a>
            </div>
          </div>
        )}

        {careProvider.website && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
            <svg
              className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
            <div>
              <div className="text-sm font-semibold text-muted-foreground mb-1">Website</div>
              <a
                href={careProvider.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-primary hover:underline flex items-center gap-1"
              >
                Visit Website
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>

      <Link
        href={`/profile/${getProfileRoute(careProvider.type)}/${careProvider.id}` as Route}
        className={`inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 md:text-base ${variant === "mobile" ? "w-full text-center" : ""}`}
      >
        View Full Profile
      </Link>
    </div>
  );
}
