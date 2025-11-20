import { Hero } from "@/components/hero";
import { DogCards } from "@/components/dog-cards";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <DogCards />
    </main>
  );
}
