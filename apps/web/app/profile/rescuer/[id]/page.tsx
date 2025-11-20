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

  // Fetch campaign updates
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
    rating: rescuer.rating || 4.8,
    totalReceived:
      transactions
        ?.filter((t) => t.type === "donation")
        .reduce((sum, t) => sum + Number(t.usd_value), 0) || 0,
    totalSpent:
      transactions
        ?.filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.usd_value), 0) || 0,
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
