"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { MapPin, TrendingUp, Target, DollarSign, Heart, Trophy, Star, Clock } from "lucide-react";
import { SharePopover } from "./SharePopover";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Dog } from "./types";

interface DonationCarouselProps {
  dog: Dog;
  totalRaised: number;
  goal: number;
  spent: number;
  shareUrl: string;
  shareText: string;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-white/60 rounded-lg p-3.5 md:p-4 border border-purple-200">
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="text-xs md:text-sm font-medium text-gray-600">{label}</span>
      </div>
      <p className="text-xl md:text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export function DonationCarousel({
  dog,
  totalRaised,
  goal,
  spent,
  shareUrl,
  shareText,
}: DonationCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    dragFree: false,
    containScroll: "trimSnaps",
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const progressPercentage = goal > 0 ? Math.round((totalRaised / goal) * 100) : 0;
  const [careProviderStats, setCareProviderStats] = useState<{
    dogsHelped: number;
    campaignsCompleted: number;
    totalReceived: number;
    rating: number;
    updatesOnTime: number;
    totalUpdates: number;
  } | null>(null);

  // Fetch care provider stats
  useEffect(() => {
    const fetchCareProviderStats = async () => {
      if (!dog.careProvider?.id) return;

      try {
        const supabase = createBrowserClient();

        // Fetch all dogs for this care provider
        const { data: dogs } = await supabase
          .from("dogs")
          .select("id")
          .eq("care_provider_id", dog.careProvider.id);

        const dogIds = dogs?.map((d: { id: string }) => d.id) || [];

        if (dogIds.length === 0) {
          setCareProviderStats({
            dogsHelped: 0,
            campaignsCompleted: 0,
            totalReceived: 0,
            rating: dog.careProvider.rating || 0,
            updatesOnTime: 0,
            totalUpdates: 0,
          });
          return;
        }

        // Fetch transactions
        const { data: transactions } = await supabase
          .from("transactions")
          .select("*")
          .in("dog_id", dogIds)
          .eq("type", "donation");

        // Fetch campaigns
        const { data: campaigns } = await supabase
          .from("campaigns")
          .select("id, goal, raised")
          .in("dog_id", dogIds);

        // Fetch updates
        const { data: updates } = await supabase
          .from("campaign_updates")
          .select("*")
          .in("dog_id", dogIds);

        // Calculate stats
        const totalReceived =
          transactions?.reduce(
            (sum: number, t: { usd_value?: string | number | null }) =>
              sum + Number(t.usd_value || 0),
            0
          ) || 0;
        const dogsHelped = dogIds.length;
        const campaignsCompleted =
          campaigns?.filter(
            (c: { raised?: string | number | null; goal?: string | number | null }) =>
              Number(c.raised || 0) >= Number(c.goal || 0) && Number(c.goal || 0) > 0
          ).length || 0;
        const totalUpdates = updates?.length || 0;
        const updatesOnTime = 0; // Would need campaign dates to calculate properly

        setCareProviderStats({
          dogsHelped,
          campaignsCompleted,
          totalReceived,
          rating: dog.careProvider.rating || 0,
          updatesOnTime,
          totalUpdates,
        });
      } catch (error) {
        console.error("Error fetching care provider stats:", error);
        // Fallback to basic stats
        setCareProviderStats({
          dogsHelped: 0,
          campaignsCompleted: 0,
          totalReceived: totalRaised,
          rating: dog.careProvider?.rating || 0,
          updatesOnTime: 0,
          totalUpdates: dog.updates?.length || 0,
        });
      }
    };

    fetchCareProviderStats();
  }, [dog.careProvider?.id, dog.updates?.length, totalRaised]);

  return (
    <div className="relative flex flex-col justify-start rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-white shadow-sm overflow-hidden">
      {/* Carousel Container */}
      <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="flex">
          {/* Slide 1: Headline Section */}
          <div className="flex-[0_0_100%] min-w-0 p-6 md:p-8">
            <div className="relative flex flex-col items-center justify-center h-full space-y-4">
              <SharePopover shareUrl={shareUrl} shareText={shareText} />
              {dog.headline && (
                <h2 className="font-sans text-2xl font-bold leading-tight text-foreground md:text-3xl lg:text-4xl text-balance text-center px-4">
                  {dog.headline}
                </h2>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-sm md:text-base">{dog.location}</span>
              </div>
            </div>
          </div>

          {/* Slide 2: Campaign Stats */}
          <div className="flex-[0_0_100%] min-w-0 p-6 md:p-8">
            <div className="flex flex-col h-full justify-center space-y-5">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">Campaign Status</h3>

              {/* Progress Bar */}
              {goal > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-sm md:text-base">
                    <span className="font-semibold text-gray-700">Fundraising Progress</span>
                    <span className="text-muted-foreground font-semibold">
                      {progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3.5 md:h-4">
                    <div
                      className="bg-primary h-3.5 md:h-4 rounded-full transition-all"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <StatCard
                  icon={<TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-600" />}
                  label="Raised"
                  value={`$${totalRaised.toLocaleString()}`}
                />
                <StatCard
                  icon={<Target className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />}
                  label="Goal"
                  value={`$${goal.toLocaleString()}`}
                />
                <StatCard
                  icon={<DollarSign className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />}
                  label="Spent"
                  value={`$${(spent || 0).toLocaleString()}`}
                />
              </div>
            </div>
          </div>

          {/* Slide 3: Care Provider Stats */}
          {careProviderStats && (
            <div className="flex-[0_0_100%] min-w-0 p-6 md:p-8">
              <div className="flex flex-col h-full justify-center space-y-5">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                  {dog.name}&apos;s{" "}
                  {dog.careProvider?.type
                    ? dog.careProvider.type.charAt(0).toUpperCase() + dog.careProvider.type.slice(1)
                    : "Care Provider"}{" "}
                  Stats
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  <StatCard
                    icon={<Heart className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />}
                    label="Dogs Helped"
                    value={careProviderStats.dogsHelped}
                  />
                  <StatCard
                    icon={<Trophy className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />}
                    label="Campaigns"
                    value={careProviderStats.campaignsCompleted}
                  />
                  <StatCard
                    icon={<TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-600" />}
                    label="Total Raised"
                    value={`$${(careProviderStats.totalReceived / 1000).toFixed(1)}k`}
                  />
                  <StatCard
                    icon={
                      <Star className="h-4 w-4 md:h-5 md:w-5 fill-yellow-400 text-yellow-400" />
                    }
                    label="Rating"
                    value={careProviderStats.rating.toFixed(1)}
                  />
                  <StatCard
                    icon={<Clock className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />}
                    label="Updates"
                    value={`${careProviderStats.updatesOnTime}/${careProviderStats.totalUpdates}`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center items-center gap-2 pb-4 pt-2">
        <button
          type="button"
          onClick={() => emblaApi?.scrollTo(0)}
          className={`h-2 rounded-full transition-all ${
            selectedIndex === 0 ? "bg-primary w-6" : "bg-primary/30 w-2"
          }`}
          aria-label="Go to headline slide"
        />
        <button
          type="button"
          onClick={() => emblaApi?.scrollTo(1)}
          className={`h-2 rounded-full transition-all ${
            selectedIndex === 1 ? "bg-primary w-6" : "bg-primary/30 w-2"
          }`}
          aria-label="Go to campaign stats slide"
        />
        {careProviderStats && (
          <button
            type="button"
            onClick={() => emblaApi?.scrollTo(2)}
            className={`h-2 rounded-full transition-all ${
              selectedIndex === 2 ? "bg-primary w-6" : "bg-primary/30 w-2"
            }`}
            aria-label="Go to care provider stats slide"
          />
        )}
        <span className="text-xs md:text-sm text-gray-500 ml-2">
          {selectedIndex === 0 ? "Headline" : selectedIndex === 1 ? "Campaign" : "Stats"}
        </span>
      </div>
    </div>
  );
}
