"use client";

import { useState, useMemo, useEffect } from "react";
import { DogCard } from "@/components/dog-card";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { normalizeRescuedBy, filterAndSortDogs, type SortOption } from "@/lib/utils/dog-cards";

interface Dog {
  id: string;
  name: string;
  location: string;
  country: string;
  state: string;
  city: string;
  images: string[];
  headline: string;
  needs_surgery: boolean;
  medical_treatment: boolean;
  medical_recovery: boolean;
  ready_for_adoption: boolean;
  requester_type: string;
  category_tags: string[];
  created_at: string;
  rescuer_name: string;
  care_provider_id: string;
  care_provider?: {
    id: string;
    name: string;
    profile_photo: string;
  };
  campaigns?: {
    id: string;
    raised: number;
    goal: number;
    status: string;
  }[];
}

export function DogCards() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requesterFilter, setRequesterFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("urgency");
  const [isMatching, setIsMatching] = useState(false);
  const router = useRouter();

  // Get campaign IDs for fetching donation totals
  const campaignIds = useMemo(() => {
    return dogs.map((dog) => dog.campaigns?.[0]?.id).filter((id): id is string => !!id);
  }, [dogs]);

  // Fetch donation totals for all campaigns
  const [donationTotals, setDonationTotals] = useState<
    Record<string, { total: number; escrow: number; instant: number }>
  >({});
  const [isLoadingDonations, setIsLoadingDonations] = useState(false);

  useEffect(() => {
    const fetchDonationTotals = async () => {
      if (campaignIds.length === 0) {
        setDonationTotals({});
        return;
      }

      setIsLoadingDonations(true);
      try {
        const supabase = createClient();
        const { data: transactions, error } = await supabase
          .from("transactions")
          .select("campaign_id, usd_value, donation_type")
          .in("campaign_id", campaignIds)
          .eq("type", "donation");

        if (error) {
          console.error("Error fetching donation totals:", error);
          setIsLoadingDonations(false);
          return;
        }

        const totals: Record<string, { total: number; escrow: number; instant: number }> = {};

        transactions?.forEach(
          (tx: {
            campaign_id: string | null;
            usd_value: number | null;
            donation_type: string | null;
          }) => {
            const campaignId = tx.campaign_id;
            if (!campaignId) return;

            if (!totals[campaignId]) {
              totals[campaignId] = { total: 0, escrow: 0, instant: 0 };
            }

            const amount = Number(tx.usd_value || 0);
            totals[campaignId].total += amount;

            if (tx.donation_type === "escrow") {
              totals[campaignId].escrow += amount;
            } else if (tx.donation_type === "instant") {
              totals[campaignId].instant += amount;
            }
          }
        );

        setDonationTotals(totals);
      } catch (err) {
        console.error("Error fetching donation totals:", err);
      } finally {
        setIsLoadingDonations(false);
      }
    };

    fetchDonationTotals();
  }, [campaignIds]);

  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    async function fetchDogs() {
      try {
        console.log("Starting to fetch dogs from Supabase");
        const supabase = createClient();

        const { data, error } = await supabase
          .from("dogs")
          .select(
            `
            *,
            care_provider:care_providers(id, name, profile_photo),
            campaigns(id, raised, goal, status)
          `
          )
          .order("created_at", { ascending: false });

        if (abortController.signal.aborted) return;

        if (error) {
          console.error("Error fetching dogs:", error.message);

          if (error.message?.includes("Too Many") || error.message?.includes("rate limit")) {
            if (isMounted) {
              setError(
                "We're experiencing high traffic. Please wait a moment and refresh the page."
              );
            }
          } else {
            if (isMounted) {
              setError("Unable to load dogs. Please try again later.");
            }
          }
          if (isMounted) setLoading(false);
          return;
        }

        console.log("Successfully fetched", data?.length || 0, "dogs");

        if (isMounted) {
          setDogs(data || []);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Unexpected error fetching dogs:", err);
        if (isMounted) {
          setError("An unexpected error occurred. Please refresh the page.");
          setLoading(false);
        }
      }
    }

    fetchDogs();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);

  const filteredAndSortedDogs = useMemo(() => {
    return filterAndSortDogs(dogs, {
      requesterType: requesterFilter,
      sortBy,
    });
  }, [dogs, requesterFilter, sortBy]);

  const handleMatchMe = () => {
    setIsMatching(true);

    setTimeout(() => {
      if (dogs.length > 0) {
        const randomDog = dogs[Math.floor(Math.random() * dogs.length)];
        router.push(`/donate/${randomDog.id}`);
      }
    }, 3000);
  };

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-gradient-to-br from-purple-600 via-purple-500 to-green-600">
        <div className="container mx-auto px-4">
          <div className="text-center text-white text-lg">Loading dogs...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 md:py-16 bg-gradient-to-br from-purple-600 via-purple-500 to-green-600">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-lg text-white mb-4">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-0 pb-12 md:pb-16"
      style={{
        backgroundImage:
          "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_uwlb3xuwlb3xuwlb-awu9qxePhWlzj1m6sjUBvyU36C8rUW.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="mb-12 pt-12 text-center md:pt-16">
          <h2 className="mb-4 text-balance font-sans text-3xl font-bold text-white md:text-4xl">
            Every dog here needs someone. One of them is waiting for you.
          </h2>
          <p className="text-pretty text-lg text-white/90">
            {"Scroll slowly. Wait for the connection. When a story grabs you… that's your dog."}
          </p>
        </div>

        <div id="match-me-section" className="mb-8 text-center">
          <button
            type="button"
            onClick={handleMatchMe}
            disabled={isMatching}
            className="group relative mb-2 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 px-8 py-4 text-lg font-bold text-purple-900 shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="text-2xl">🐾</span>
            <span>Match Me With a Dog</span>
            <span className="text-2xl">🐾</span>
          </button>
          <p className="text-sm text-white/90">
            {"Choosing a dog is hard. So we let them choose you."}
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="requester-filter" className="text-sm font-medium text-white">
              Care Provider Type:
            </label>
            <select
              id="requester-filter"
              value={requesterFilter}
              onChange={(e) => setRequesterFilter(e.target.value)}
              className="rounded-md border border-white/20 bg-white/10 px-4 py-2 text-white backdrop-blur-md transition-all hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all" className="bg-purple-700">
                All
              </option>
              <option value="Shelter" className="bg-purple-700">
                Shelter
              </option>
              <option value="Veterinary" className="bg-purple-700">
                Veterinary
              </option>
              <option value="Rescuer" className="bg-purple-700">
                Rescuer
              </option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-filter" className="text-sm font-medium text-white">
              Sort By:
            </label>
            <select
              id="sort-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-md border border-white/20 bg-white/10 px-4 py-2 text-white backdrop-blur-md transition-all hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="urgency" className="bg-purple-700">
                Most Urgent
              </option>
              <option value="lessFunded" className="bg-purple-700">
                Least Funded
              </option>
              <option value="recent" className="bg-purple-700">
                Most Recent
              </option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedDogs.map((dog) => {
            const campaignId = dog.campaigns?.[0]?.id;
            const donationTotalsForCampaign = campaignId ? donationTotals[campaignId] : null;
            const totalRaised = donationTotalsForCampaign?.total || 0;
            const escrowDonations = donationTotalsForCampaign?.escrow || 0;
            const instantDonations = donationTotalsForCampaign?.instant || 0;

            return (
              <DogCard
                key={dog.id}
                id={dog.id}
                name={dog.name}
                location={dog.location}
                image={
                  Array.isArray(dog.images) && dog.images.length > 0
                    ? dog.images[0]
                    : "/placeholder.svg"
                }
                headline={dog.headline}
                raised={instantDonations}
                goal={dog.campaigns?.[0]?.goal || 0}
                needsSurgery={dog.needs_surgery}
                medicalTreatment={dog.medical_treatment}
                medicalRecovery={dog.medical_recovery}
                readyForAdoption={dog.ready_for_adoption}
                requesterType={dog.requester_type}
                categoryTags={dog.category_tags}
                createdAt={new Date(dog.created_at)}
                rescuedBy={normalizeRescuedBy(dog.requester_type)}
                rescuerName={dog.rescuer_name}
                rescuerId={dog.care_provider_id}
                rescuerImage={dog.care_provider?.profile_photo || "/placeholder.svg"}
                country={dog.country}
                state={dog.state}
                city={dog.city}
                escrowBalance={escrowDonations > 0 ? escrowDonations : undefined}
                isLoadingEscrow={isLoadingDonations}
              />
            );
          })}
        </div>

        <div className="mt-6">
          <p className="text-left text-white/80">
            Showing {filteredAndSortedDogs.length} of {dogs.length} dogs
          </p>
        </div>

        {filteredAndSortedDogs.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg text-white/80">
              No dogs match your filter. Try selecting a different type.
            </p>
          </div>
        )}
      </div>

      {isMatching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800">
          <div className="relative text-center">
            <div className="mb-8 text-4xl font-bold text-white md:text-6xl">
              A tail is picking you!
            </div>
            <div className="relative mx-auto h-32 w-32">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 animate-ping"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: "2s",
                  }}
                >
                  <svg
                    viewBox="0 0 512 512"
                    className="h-full w-full fill-white opacity-75"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Paw print animation"
                  >
                    <title>Paw print</title>
                    <path d="M256 224c-79.37 0-191.1 122.7-191.1 200.2C64.02 459.1 90.76 480 135.8 480C184.6 480 216.9 454.9 256 454.9C295.5 454.9 327.9 480 376.2 480c44.1 0 71.74-20.88 71.74-55.75C447.1 346.8 335.4 224 256 224zM108.8 211.4c-10.37-34.62-42.5-57.12-71.62-50.12S-7.104 202 3.27 236.6C13.64 271.3 45.77 293.8 74.89 286.8S119.1 246 108.8 211.4zM193.5 190.6c30.87-8.125 46.37-49.1 34.5-93.37s-46.5-71.1-77.49-63.87c-30.87 8.125-46.37 49.1-34.5 93.37C127.9 270.1 162.5 298.8 193.5 190.6zM474.9 161.3c-29.12-6.1-61.25 15.5-71.62 50.12c-10.37 34.63 4.75 68.37 33.87 75.37c29.12 6.1 61.12-15.5 71.62-50.12C519.1 202 503.1 168.3 474.9 161.3zM318.5 190.6c30.1 8.125 65.62-20.5 77.49-63.87c11.87-43.37-3.625-85.25-34.5-93.37c-30.1-8.125-65.62 20.5-77.49 63.87C272.1 140.6 287.6 182.5 318.5 190.6z" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
