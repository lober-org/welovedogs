import { CareProvidersHero } from "@/components/care-providers-hero";
import { CareProviderCards } from "@/components/care-provider-cards";

export default function CareProvidersPage() {
  return (
    <main className="min-h-screen">
      <CareProvidersHero />
      <CareProviderCards />
    </main>
  );
}
