import { notFound } from "next/navigation";
import { DonationStory } from "@/components/donation-story";
import { StickyDonationWidget } from "@/components/sticky-donation-widget";
import { createClient } from "@/lib/supabase/server";

export default async function DonatePage({ params }: { params: Promise<{ dogId: string }> }) {
  const { dogId } = await params;

  console.log("Fetching dog with ID:", dogId);

  const supabase = await createClient();

  const { data: dog, error } = await supabase
    .from("dogs")
    .select(
      `
      *,
      care_provider:care_providers(*),
      campaigns(
        id,
        raised,
        goal,
        spent,
        status,
        headline,
        created_at,
        escrow_contract_id
      ),
      campaign_updates(*),
      transactions(*),
      campaign_expenses(*)
    `
    )
    .eq("id", dogId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching dog:", error.message, error.details, error.hint);
    notFound();
  }

  if (!dog) {
    console.log("Dog not found");
    notFound();
  }

  const activeCampaign = Array.isArray(dog.campaigns)
    ? dog.campaigns.find((c: any) => c.status === "Active")
    : dog.campaigns?.status === "Active"
      ? dog.campaigns
      : null;

  console.log("Active campaign found:", !!activeCampaign);

  const transformedDog = {
    id: dog.id,
    name: dog.name,
    location: dog.location,
    headline: activeCampaign?.headline || dog.headline,
    isEmergency: dog.is_emergency || false,
    emergencyExplanation: dog.emergency_explanation,
    images: Array.isArray(dog.images) ? dog.images : [],
    categoryTags: Array.isArray(dog.category_tags) ? dog.category_tags : [],
    currentCondition: dog.current_condition,
    fundsNeededFor: Array.isArray(dog.funds_needed_for) ? dog.funds_needed_for : [],
    story: dog.story,
    raised: activeCampaign ? Number(activeCampaign.raised) || 0 : 0,
    goal: activeCampaign ? Number(activeCampaign.goal) || 0 : 0,
    spent: activeCampaign ? Number(activeCampaign.spent) || 0 : 0,
    confirmation: dog.confirmation,
    careProvider: dog.care_provider
      ? {
          id: dog.care_provider.id,
          name: dog.care_provider.name,
          type: dog.care_provider.type,
          location: dog.care_provider.location,
          image: dog.care_provider.profile_photo || dog.care_provider.image,
          rating: Number(dog.care_provider.rating) || 0,
          about: dog.care_provider.about,
          description: dog.care_provider.description,
          email: dog.care_provider.email,
          phone: dog.care_provider.phone,
          website: dog.care_provider.website,
        }
      : undefined,
    updates:
      dog.campaign_updates?.map((update: any) => ({
        title: update.title,
        date: new Date(update.created_at).toLocaleDateString(),
        description: update.content,
        image: update.image,
      })) || [],
    transactions:
      dog.transactions?.map((tx: any) => ({
        date: new Date(tx.created_at).toLocaleDateString(),
        cryptoAmount: tx.crypto_amount,
        tokenSymbol: tx.token_symbol,
        usdValue: Number(tx.usd_value) || 0,
        donor: tx.donor_address,
        txHash: tx.tx_hash,
        explorerUrl: tx.explorer_url,
      })) || [],
    expenses:
      dog.campaign_expenses?.map((expense: any) => ({
        id: expense.id,
        title: expense.title,
        description: expense.description,
        amount: Number(expense.amount) || 0,
        date: new Date(expense.created_at).toLocaleDateString(),
        proof: expense.proof,
      })) || [],
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 md:px-6 lg:px-8 xl:px-12 py-4 md:py-8 md:py-12 max-w-[1400px]">
        {!activeCampaign && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              This dog doesn't have an active fundraising campaign yet. Check back soon!
            </p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_340px] xl:gap-12 lg:items-start">
          <div className="min-w-0 w-full">
            <DonationStory dog={transformedDog} />
          </div>

          <div className="hidden lg:block">
            <StickyDonationWidget
              dogName={transformedDog.name}
              raised={transformedDog.raised}
              spent={transformedDog.spent}
              fundsNeededFor={transformedDog.fundsNeededFor}
              campaignId={activeCampaign?.id}
              careProviderAddress={dog.care_provider?.stellar_address || undefined}
              goal={activeCampaign ? Number(activeCampaign.goal) || 0 : 0}
            />
          </div>
        </div>

        <div className="lg:hidden mt-6">
          <StickyDonationWidget
            dogName={transformedDog.name}
            raised={transformedDog.raised}
            spent={transformedDog.spent}
            fundsNeededFor={transformedDog.fundsNeededFor}
            campaignId={activeCampaign?.id}
            careProviderAddress={dog.care_provider?.stellar_address || undefined}
            goal={activeCampaign ? Number(activeCampaign.goal) || 0 : 0}
          />
        </div>
      </div>
    </div>
  );
}
