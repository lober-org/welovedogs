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
import { MapPin, Heart } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface CareProvider {
  id: string;
  name: string;
  type: string;
  location: string;
  city: string;
  state: string;
  image: string;
  description: string;
  dogs_helped: number;
  email: string;
  phone: string;
}

export function CareProviderCards() {
  const router = useRouter();
  const [careProviders, setCareProviders] = useState<CareProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchCareProviders() {
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

      setCareProviders(data || []);
      setLoading(false);
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

  const uniqueStates = Array.from(new Set(careProviders.map((p) => p.state))).sort();

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
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
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
            {/** biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="text-sm font-medium text-white">Location:</label>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-white/20 text-white border-white/20">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProviders.map((provider) => (
            // biome-ignore lint/a11y/noStaticElementInteractions: <explanation>
            // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
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
                      {provider.type}
                    </span>
                  </div>

                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={provider.image || "/placeholder.svg"}
                      alt={provider.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>

                <CardContent className="px-6 pb-6 pt-4 flex flex-col flex-grow">
                  <div className="mb-4 flex-grow">
                    <h3 className="mb-2 font-sans text-2xl font-bold text-white">
                      {provider.name}
                    </h3>

                    <div className="mb-3 flex items-center gap-1 text-sm text-white/80">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{provider.location}</span>
                    </div>

                    <p className="mb-4 text-sm leading-relaxed text-white/90">
                      {provider.description}
                    </p>

                    <div className="mb-4 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-white/80" />
                      <span className="text-sm font-medium text-white">
                        {provider.dogs_helped} dogs helped
                      </span>
                    </div>
                  </div>

                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {filteredProviders.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg text-white">No care providers found matching your filters.</p>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-white/80">
          Showing {filteredProviders.length} of {careProviders.length} care providers
        </div>
      </div>
    </section>
  );
}
