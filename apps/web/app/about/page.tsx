import { AboutHero } from "@/components/about-hero";
import { AboutTechnology } from "@/components/about-technology";

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <AboutHero />
      <AboutTechnology />
    </main>
  );
}
