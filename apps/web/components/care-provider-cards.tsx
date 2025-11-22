"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Heart, TrendingUp, Trophy, Star, Users, Shield } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface CareProvider {
  id: string;
  name: string;
  type: string;
  location: string;
  city: string;
  state: string;
  profile_photo?: string;
  image?: string;
  description: string;
  dogs_helped: number;
  email: string;
  phone: string;
  rating?: number;
  // Stats we'll calculate
  totalDogs?: number;
  totalRaised?: number;
  activeCampaigns?: number;
  completedCampaigns?: number;
  reputation?: number;
  level?: {
    name: string;
    icon: string;
    color: string;
  };
}

export function CareProviderCards() {
  const router = useRouter();
  const [careProviders, setCareProviders] = useState<CareProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchCareProviders() {
      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("care_providers")
          .select("*")
          .order("dogs_helped", { ascending: false });

        if (error) {
          console.error("Error fetching care providers:", error);
          setLoading(false);
          return;
        }

        if (!data || data.length === 0) {
          console.log("No care providers found");
          setCareProviders([]);
          setLoading(false);
          return;
        }

        console.log("Fetched care providers:", data.length);

        // Fetch additional stats for each care provider
        const providersWithStats = await Promise.all(
          data.map(async (provider: Record<string, unknown>) => {
            try {
              const providerId = provider.id as string;
              if (!providerId) {
                console.warn("Provider missing ID:", provider);
                return null;
              }

              // Fetch dogs count
              const { count: dogsCount, error: dogsCountError } = await supabase
                .from("dogs")
                .select("*", { count: "exact", head: true })
                .eq("care_provider_id", providerId);

              if (dogsCountError) {
                console.error(`Error fetching dogs count for ${providerId}:`, dogsCountError);
              }

              // Fetch dog IDs for this provider
              const { data: dogs, error: dogsError } = await supabase
                .from("dogs")
                .select("id")
                .eq("care_provider_id", providerId);

              if (dogsError) {
                console.error(`Error fetching dogs for ${providerId}:`, dogsError);
              }

              const dogIds = dogs?.map((d: { id: string }) => d.id) || [];

              // Fetch transactions for total raised
              let totalRaised = 0;
              if (dogIds.length > 0) {
                const { data: transactions, error: transactionsError } = await supabase
                  .from("transactions")
                  .select("usd_value")
                  .in("dog_id", dogIds)
                  .eq("type", "donation");

                if (transactionsError) {
                  console.error(
                    `Error fetching transactions for ${providerId}:`,
                    transactionsError
                  );
                } else {
                  totalRaised =
                    transactions?.reduce(
                      (sum: number, t: { usd_value?: number | string | null }) =>
                        sum + Number(t.usd_value || 0),
                      0
                    ) || 0;
                }
              }

              // Fetch campaigns
              let activeCampaigns = 0;
              let completedCampaigns = 0;
              if (dogIds.length > 0) {
                const { data: campaigns, error: campaignsError } = await supabase
                  .from("campaigns")
                  .select("status, goal, raised")
                  .in("dog_id", dogIds);

                if (campaignsError) {
                  console.error(`Error fetching campaigns for ${providerId}:`, campaignsError);
                } else {
                  activeCampaigns =
                    campaigns?.filter((c: { status: string }) => c.status === "Active").length || 0;
                  completedCampaigns =
                    campaigns?.filter(
                      (c: { goal?: number | string | null; raised?: number | string | null }) =>
                        Number(c.raised || 0) >= Number(c.goal || 0) && Number(c.goal || 0) > 0
                    ).length || 0;
                }
              }

              // Calculate reputation score (0-1000)
              // Based on: total received (40%), dogs helped (30%), rating (20%), campaigns completed (10%)
              const dogsHelped = dogsCount || 0;
              const rating = Number(provider.rating) || 0;
              const reputationScore = Math.min(
                Math.floor(
                  (totalRaised / 100000) * 400 + // Up to 400 points from donations (scaled to $100k)
                    Math.min(dogsHelped * 10, 300) + // Up to 300 points from dogs helped (max 30 dogs)
                    (rating / 5) * 200 + // Up to 200 points from rating (5.0 = 200)
                    Math.min(completedCampaigns * 10, 100) // Up to 100 points from campaigns (max 10 campaigns)
                ),
                1000
              );

              // Determine level based on total received and reputation
              const getCareProviderLevel = (received: number, rep: number) => {
                if (rep >= 800 || received >= 50000) {
                  return { name: "Elite", icon: "🏆", color: "yellow" };
                } else if (rep >= 600 || received >= 25000) {
                  return { name: "Expert", icon: "⭐", color: "purple" };
                } else if (rep >= 400 || received >= 10000) {
                  return { name: "Advanced", icon: "🌟", color: "blue" };
                } else if (rep >= 200 || received >= 5000) {
                  return { name: "Intermediate", icon: "✨", color: "green" };
                } else {
                  return { name: "Beginner", icon: "🌱", color: "gray" };
                }
              };

              const level = getCareProviderLevel(totalRaised, reputationScore);

              return {
                id: providerId,
                name: (provider.name as string) || "",
                type: (provider.type as string) || "",
                location: (provider.location as string) || "",
                city: (provider.city as string) || "",
                state: (provider.state as string) || "",
                profile_photo: (provider.profile_photo as string) || undefined,
                image: (provider.image as string) || undefined,
                description: (provider.description as string) || "",
                dogs_helped: Number(provider.dogs_helped) || 0,
                email: (provider.email as string) || "",
                phone: (provider.phone as string) || "",
                rating: rating,
                totalDogs: dogsCount || 0,
                totalRaised,
                activeCampaigns,
                completedCampaigns,
                reputation: reputationScore,
                level,
              };
            } catch (err) {
              console.error("Error processing provider:", err, provider);
              return null;
            }
          })
        );

        // Filter out null values
        const validProviders = providersWithStats.filter((p): p is CareProvider => p !== null);

        console.log("Providers with stats:", validProviders.length);
        console.log("Sample provider data:", validProviders[0]);
        setCareProviders(validProviders);
      } catch (err) {
        console.error("Error in fetchCareProviders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCareProviders();
  }, []);

  const filteredProviders = careProviders.filter((provider) => {
    const matchesType = typeFilter === "all" || provider.type === typeFilter;
    const matchesLocation = locationFilter === "all" || provider.state === locationFilter;
    return matchesType && matchesLocation;
  });

  const getBannerColor = (type: string) => {
    switch (type) {
      case "shelter":
        return "bg-blue-500";
      case "veterinarian":
        return "bg-green-500";
      case "rescuer":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const uniqueStates = Array.from(
    new Set(
      careProviders.map((p) => p.state).filter((state): state is string => Boolean(state?.trim()))
    )
  ).sort();

  const getProfileRoute = (type: string) => {
    if (type === "veterinarian") {
      return "veterinary";
    }
    return type; // shelter, rescuer remain the same
  };

  if (loading) {
    return (
      <section className="relative bg-primary py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-white text-lg">Loading care providers...</div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative bg-primary py-12"
      style={{
        backgroundImage: "url('/images/gemini-generated-image-uwlb3xuwlb3xuwlb.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/** biome-ignore lint/a11y/noLabelWithoutControl: Label is associated with Select below */}
            <label className="text-sm font-medium text-white">Heroe Type:</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-white/20 text-white border-white/20">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="shelter">Shelter</SelectItem>
                <SelectItem value="veterinarian">Veterinary</SelectItem>
                <SelectItem value="rescuer">Rescuer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/** biome-ignore lint/a11y/noLabelWithoutControl: Label is associated with Select below */}
            <label className="text-sm font-medium text-white">Location:</label>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-white/20 text-white border-white/20">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueStates
                  .filter((state) => state && state.trim() !== "")
                  .map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredProviders.length === 0 && !loading && (
          <div className="py-12 text-center">
            <p className="text-lg text-white">No care providers found matching your filters.</p>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProviders.map((provider) => {
            const imageUrl = provider.profile_photo || provider.image || "/placeholder.svg";
            const displayName = provider.name || "Unknown";
            const displayLocation =
              provider.location ||
              `${provider.city || ""}, ${provider.state || ""}`.trim() ||
              "Location not specified";
            const displayDescription = provider.description || "No description available.";

            return (
              // biome-ignore lint/a11y/noStaticElementInteractions: Card is clickable
              // biome-ignore lint/a11y/useKeyWithClickEvents: Card is clickable
              <div
                key={provider.id}
                onClick={() =>
                  router.push(`/profile/${getProfileRoute(provider.type)}/${provider.id}` as Route)
                }
                className="cursor-pointer"
              >
                <Card className="group overflow-hidden border-white/20 bg-white/20 backdrop-blur-md transition-all duration-300 hover:bg-white/30 hover:shadow-xl p-0 flex flex-col h-full">
                  <div className="flex flex-col">
                    <div
                      className={`${getBannerColor(provider.type)} flex h-8 items-center justify-center`}
                    >
                      <span className="text-sm font-bold uppercase tracking-wider text-white">
                        {provider.type || "care provider"}
                      </span>
                    </div>

                    <div className="relative aspect-4/3 overflow-hidden bg-gray-200">
                      <Image
                        src={imageUrl}
                        alt={displayName}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          if (target.src !== "/placeholder.svg") {
                            target.src = "/placeholder.svg";
                          }
                        }}
                      />
                    </div>
                  </div>

                  <CardContent className="px-6 pb-6 pt-4 flex flex-col grow">
                    <div className="mb-4 grow">
                      <h3 className="mb-2 font-sans text-2xl font-bold text-white">
                        {displayName}
                      </h3>

                      <div className="mb-3 flex items-center gap-1 text-sm text-white/80">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{displayLocation}</span>
                      </div>

                      <p className="mb-4 text-sm leading-relaxed text-white/90 line-clamp-2">
                        {displayDescription}
                      </p>

                      {/* Reputation and Level Badge */}
                      {provider.reputation !== undefined && provider.level && (
                        <div className="mb-4 flex items-center gap-3 rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                          <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-white/90" />
                            <div className="flex flex-col">
                              <span className="text-xs text-white/70">Reputation</span>
                              <span className="text-base font-bold text-white">
                                {provider.reputation}
                              </span>
                            </div>
                          </div>
                          <div className="h-8 w-px bg-white/20" />
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{provider.level.icon}</span>
                            <div className="flex flex-col">
                              <span className="text-xs text-white/70">Level</span>
                              <span className="text-sm font-bold text-white">
                                {provider.level.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Stats Grid */}
                      <div className="mb-4 grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 rounded-lg bg-white/10 p-2.5 backdrop-blur-sm">
                          <Users className="h-4 w-4 text-white/90" />
                          <div className="flex flex-col">
                            <span className="text-xs text-white/70">Dogs</span>
                            <span className="text-sm font-bold text-white">
                              {provider.totalDogs ?? 0}
                            </span>
                          </div>
                        </div>

                        {provider.activeCampaigns && provider.activeCampaigns > 0 ? (
                          <div className="flex items-center gap-2 rounded-lg bg-green-500/20 border border-green-400/30 p-2.5 backdrop-blur-sm">
                            <Heart className="h-4 w-4 text-green-300" />
                            <div className="flex flex-col">
                              <span className="text-xs text-green-200">Active</span>
                              <span className="text-sm font-bold text-green-100">
                                {provider.activeCampaigns} Campaign
                                {provider.activeCampaigns !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 rounded-lg bg-white/10 p-2.5 backdrop-blur-sm">
                            <Trophy className="h-4 w-4 text-white/90" />
                            <div className="flex flex-col">
                              <span className="text-xs text-white/70">Completed</span>
                              <span className="text-sm font-bold text-white">
                                {provider.completedCampaigns ?? 0}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 rounded-lg bg-white/10 p-2.5 backdrop-blur-sm">
                          <TrendingUp className="h-4 w-4 text-white/90" />
                          <div className="flex flex-col">
                            <span className="text-xs text-white/70">Raised</span>
                            <span className="text-sm font-bold text-white">
                              {provider.totalRaised && provider.totalRaised > 0
                                ? `$${(provider.totalRaised / 1000).toFixed(1)}k`
                                : "$0"}
                            </span>
                          </div>
                        </div>

                        {provider.rating && provider.rating > 0 ? (
                          <div className="flex items-center gap-2 rounded-lg bg-white/10 p-2.5 backdrop-blur-sm">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <div className="flex flex-col">
                              <span className="text-xs text-white/70">Rating</span>
                              <span className="text-sm font-bold text-white">
                                {provider.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 rounded-lg bg-white/10 p-2.5 backdrop-blur-sm">
                            <Trophy className="h-4 w-4 text-white/90" />
                            <div className="flex flex-col">
                              <span className="text-xs text-white/70">Campaigns</span>
                              <span className="text-sm font-bold text-white">
                                {provider.completedCampaigns ?? 0}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-sm text-white/80">
          Showing {filteredProviders.length} of {careProviders.length} care providers
        </div>
      </div>
    </section>
  );
}
