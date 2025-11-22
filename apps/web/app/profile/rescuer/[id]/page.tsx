import { createClient, createStaticClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import RescuerProfileClient from "./RescuerProfileClient";

export async function generateStaticParams() {
  const supabase = createStaticClient();

  const { data: careProviders } = await supabase
    .from("care_providers")
    .select("id")
    .eq("type", "rescuer")
    .limit(10);

  return careProviders?.map((cp) => ({ id: cp.id })) || [];
}

export default async function RescuerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  console.log("Fetching rescuer profile with ID:", id);

  // Fetch rescuer data
  const { data: rescuer, error } = await supabase
    .from("care_providers")
    .select(
      `
      *,
      dogs (
        id,
        name,
        images,
        campaigns (
          id,
          goal,
          raised
        )
      )
    `
    )
    .eq("id", id)
    .eq("type", "rescuer")
    .single();

  if (error || !rescuer) {
    console.log("Rescuer not found:", error);
    notFound();
  }

  console.log("Successfully fetched rescuer data");

  // Fetch transactions
  const { data: dogs } = await supabase.from("dogs").select("id").eq("care_provider_id", id);

  const dogIds = dogs?.map((d) => d.id) || [];

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .in("dog_id", dogIds)
    .order("created_at", { ascending: false })
    .limit(20);

  // Fetch campaigns to get campaign start dates
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, created_at, dog_id")
    .in("dog_id", dogIds);

  // Fetch campaign updates (all updates for calculation)
  const { data: allUpdates } = await supabase
    .from("campaign_updates")
    .select("*")
    .in("dog_id", dogIds)
    .order("created_at", { ascending: false });

  // Fetch latest updates for display (limit 10)
  const { data: updates } = await supabase
    .from("campaign_updates")
    .select(
      `
      *,
      dogs (
        name,
        images
      )
    `
    )
    .in("dog_id", dogIds)
    .order("created_at", { ascending: false })
    .limit(10);

  // Calculate metrics for reputation and level
  const totalReceived =
    transactions
      ?.filter((t) => t.type === "donation")
      .reduce((sum, t) => sum + Number(t.usd_value), 0) || 0;
  const totalSpent =
    transactions
      ?.filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.usd_value), 0) || 0;
  const dogsHelped = rescuer.dogs?.length || 0;
  const campaignsCompleted =
    rescuer.dogs?.reduce(
      (sum: number, dog: any) =>
        sum + (dog.campaigns?.filter((c: any) => c.raised >= c.goal && c.goal > 0).length || 0),
      0
    ) || 0;
  const rating = rescuer.rating || 4.8;

  // Calculate updates tracked on time
  // An update is "on time" if it's posted within 30 days of campaign start or within 30 days of previous update
  const totalUpdates = allUpdates?.length || 0;
  let updatesOnTime = 0;

  if (allUpdates && allUpdates.length > 0 && campaigns) {
    // Create a map of campaign_id to campaign start date
    const campaignStartDates = new Map<string, Date>();
    campaigns.forEach((campaign: any) => {
      campaignStartDates.set(campaign.id, new Date(campaign.created_at));
    });

    // Group updates by campaign_id
    const updatesByCampaign = new Map<string, any[]>();

    allUpdates.forEach((update: any) => {
      const campaignId = update.campaign_id;
      if (campaignId) {
        if (!updatesByCampaign.has(campaignId)) {
          updatesByCampaign.set(campaignId, []);
        }
        updatesByCampaign.get(campaignId)!.push(update);
      }
    });

    // Check each campaign's updates
    updatesByCampaign.forEach((campaignUpdates, campaignId) => {
      const campaignStart = campaignStartDates.get(campaignId);
      if (!campaignStart) return; // Skip if campaign not found

      // Sort by date ascending
      const sortedUpdates = [...campaignUpdates].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      sortedUpdates.forEach((update, index) => {
        const updateDate = new Date(update.created_at);

        if (index === 0) {
          // First update: on time if within 30 days of campaign start
          const daysSinceCampaignStart =
            (updateDate.getTime() - campaignStart.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceCampaignStart <= 30 && daysSinceCampaignStart >= 0) {
            updatesOnTime++;
          }
        } else {
          // Subsequent updates: on time if within 30 days of previous update
          const previousUpdateDate = new Date(sortedUpdates[index - 1].created_at);
          const daysSincePreviousUpdate =
            (updateDate.getTime() - previousUpdateDate.getTime()) / (1000 * 60 * 60 * 24);

          if (daysSincePreviousUpdate <= 30 && daysSincePreviousUpdate >= 0) {
            updatesOnTime++;
          }
        }
      });
    });
  }

  // Calculate reputation score (0-1000)
  // Based on: total received (40%), dogs helped (30%), rating (20%), campaigns completed (10%)
  const reputationScore = Math.min(
    Math.floor(
      (totalReceived / 100000) * 400 + // Up to 400 points from donations (scaled to $100k)
        Math.min(dogsHelped * 10, 300) + // Up to 300 points from dogs helped (max 30 dogs)
        (rating / 5) * 200 + // Up to 200 points from rating (5.0 = 200)
        Math.min(campaignsCompleted * 10, 100) // Up to 100 points from campaigns (max 10 campaigns)
    ),
    1000
  );

  // Determine level based on total received and reputation
  const getRescuerLevel = (received: number, rep: number) => {
    if (rep >= 800 || received >= 50000) {
      return { name: "Elite", icon: "🏆", color: "yellow", minReceived: 50000 };
    } else if (rep >= 600 || received >= 25000) {
      return { name: "Expert", icon: "⭐", color: "purple", minReceived: 25000 };
    } else if (rep >= 400 || received >= 10000) {
      return { name: "Advanced", icon: "🌟", color: "blue", minReceived: 10000 };
    } else if (rep >= 200 || received >= 5000) {
      return { name: "Intermediate", icon: "✨", color: "green", minReceived: 5000 };
    } else {
      return { name: "Beginner", icon: "🌱", color: "gray", minReceived: 0 };
    }
  };

  const level = getRescuerLevel(totalReceived, reputationScore);

  // Transform data for client component
  const rescuerData = {
    id: rescuer.id,
    fullName: rescuer.name,
    profilePhoto: rescuer.profile_photo || "/placeholder.svg",
    country: rescuer.country || "United States",
    city: rescuer.city || "",
    email: rescuer.email,
    socialMedia: {
      instagram: rescuer.social_instagram,
      tiktok: rescuer.social_tiktok,
      facebook: rescuer.social_facebook,
      youtube: rescuer.social_youtube,
      twitter: rescuer.social_twitter,
    },
    story: rescuer.story || null,
    rating,
    totalReceived,
    totalSpent,
    dogsHelped,
    campaignsCompleted,
    updatesOnTime,
    totalUpdates,
    reputation: reputationScore,
    level,
    currentCauses:
      rescuer.dogs?.map((dog: any) => ({
        dogId: dog.id,
        dogName: dog.name,
        dogImage:
          Array.isArray(dog.images) && dog.images.length > 0 ? dog.images[0] : "/placeholder.svg",
        goal: dog.campaigns?.[0]?.goal || 0,
        raised: dog.campaigns?.[0]?.raised || 0,
      })) || [],
    transactions:
      transactions?.map((t: any) => ({
        date: new Date(t.created_at).toLocaleDateString(),
        type: t.type,
        amount: Number(t.usd_value),
        crypto: t.crypto_amount ? `${t.crypto_amount} ${t.token_symbol}` : undefined,
        donor: t.donor_address,
        txHash: t.tx_hash,
        description: t.description,
      })) || [],
    latestUpdates:
      updates?.map((u: any) => ({
        dogName: u.dogs?.name || "",
        dogImage:
          Array.isArray(u.dogs?.images) && u.dogs.images.length > 0
            ? u.dogs.images[0]
            : "/placeholder.svg",
        update: u.content,
        date: new Date(u.created_at).toLocaleDateString(),
      })) || [],
  };

  return <RescuerProfileClient rescuer={rescuerData} />;
}
