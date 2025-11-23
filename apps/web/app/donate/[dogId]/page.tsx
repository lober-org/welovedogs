import { notFound } from "next/navigation";
import { DonationStory } from "@/components/donation-story";
import { StickyDonationWidget } from "@/components/sticky-donation-widget";
import {
  fetchDogData,
  fetchDonationTransactions,
  findActiveCampaign,
  transformDogData,
} from "@/lib/utils/donate-page";

export default async function DonatePage({ params }: { params: Promise<{ dogId: string }> }) {
  const { dogId } = await params;

  console.log("Fetching dog with ID:", dogId);

  try {
    const dog = await fetchDogData(dogId);
    const donationTransactions = await fetchDonationTransactions(dogId);

    if (!dog) {
      console.log("Dog not found");
      notFound();
    }

    const activeCampaign = findActiveCampaign(dog.campaigns);
    console.log("Active campaign found:", !!activeCampaign);

    const transformedDog = transformDogData(dog, activeCampaign, donationTransactions);

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-3 md:px-6 lg:px-8 xl:px-12 py-4 md:py-8 lg:py-12 max-w-[1400px]">
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
                spent={transformedDog.spent || 0}
                fundsNeededFor={transformedDog.fundsNeededFor}
                campaignId={activeCampaign?.id}
                careProviderAddress={dog.care_provider?.stellar_address || undefined}
                campaignStellarAddress={activeCampaign?.stellar_address || undefined}
                goal={activeCampaign ? Number(activeCampaign.goal) || 0 : 0}
              />
            </div>
          </div>

          <div className="lg:hidden mt-6">
            <StickyDonationWidget
              dogName={transformedDog.name}
              raised={transformedDog.raised}
              spent={transformedDog.spent || 0}
              fundsNeededFor={transformedDog.fundsNeededFor}
              campaignId={activeCampaign?.id}
              careProviderAddress={dog.care_provider?.stellar_address || undefined}
              campaignStellarAddress={activeCampaign?.stellar_address || undefined}
              goal={activeCampaign ? Number(activeCampaign.goal) || 0 : 0}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading donate page:", error);
    notFound();
  }
}
