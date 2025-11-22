import { createClient, createStaticClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import VeterinaryProfilePageClient from "./VeterinaryProfilePageClient";

export async function generateStaticParams() {
  const supabase = createStaticClient();

  const { data: careProviders } = await supabase
    .from("care_providers")
    .select("id")
    .eq("type", "veterinarian")
    .limit(10);

  return careProviders?.map((cp) => ({ id: cp.id })) || [];
}

export default async function VeterinaryProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  console.log("Fetching veterinarian profile with ID:", id);

  // Fetch veterinarian data
  const { data: vet, error } = await supabase
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
    .eq("type", "veterinarian")
    .single();

  if (error || !vet) {
    console.log("Veterinarian not found:", error);
    notFound();
  }

  console.log("Successfully fetched veterinarian data");

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

  // Handle social media fields - check both separate columns and nested object formats
  const vetDataRecord = vet as Record<string, unknown>;
  const socialMediaLinkedin =
    (vetDataRecord.social_linkedin as string) ||
    ((vetDataRecord.social_media as Record<string, unknown>)?.linkedin as string) ||
    "";
  const socialMediaInstagram =
    (vetDataRecord.social_instagram as string) ||
    ((vetDataRecord.social_media as Record<string, unknown>)?.instagram as string) ||
    "";
  const socialMediaFacebook =
    (vetDataRecord.social_facebook as string) ||
    ((vetDataRecord.social_media as Record<string, unknown>)?.facebook as string) ||
    "";

  // Handle description - check multiple possible fields
  const description = (vet.description as string) || (vet.about as string) || "";

  // Transform data for client component - pass as props to avoid client-side mock data
  const veterinarianData = {
    id: vet.id,
    fullName: vet.name,
    profilePhoto: vet.profile_photo || "/placeholder.svg",
    clinicName: vet.clinic_name || "",
    country: vet.country || "United States",
    city: vet.city || "",
    email: vet.email,
    phone: vet.phone,
    website: vet.website,
    socialMedia: {
      linkedin: socialMediaLinkedin,
      instagram: socialMediaInstagram,
      facebook: socialMediaFacebook,
    },
    description: description,
    story: vet.story || null,
    rating: vet.rating || 4.8,
    totalReceived:
      transactions
        ?.filter((t) => t.type === "donation")
        .reduce((sum, t) => sum + Number(t.usd_value), 0) || 0,
    totalSpent:
      transactions
        ?.filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + Number(t.usd_value), 0) || 0,
    currentCauses:
      vet.dogs?.map((dog: any) => ({
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

  return <VeterinaryProfilePageClient veterinarian={veterinarianData} />;
}
