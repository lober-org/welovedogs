import { CaretakersBanner } from "./caretakers-banner";

export function CareProvidersHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="container relative z-10 mx-auto px-4 py-8 pb-12 md:py-12 md:pb-16 lg:py-16 lg:pb-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-3 text-balance font-sans text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Meet the Heroes Changing Dogs' Lives Every Day
          </h1>

          <div className="mb-4 flex justify-center">
            <CaretakersBanner className="h-auto w-full max-w-3xl" />
          </div>

          <p className="text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            Vets, rescuers, and shelters who step in first, stay the longest, and care the hardest.
            Their work gives dogs a second chance—one treatment, rescue, and safe place at a time.
          </p>
        </div>
      </div>
    </section>
  );
}
