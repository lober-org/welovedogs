import { LoberFinal } from "./lober-final";

export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="container relative z-10 mx-auto px-4 py-8 pb-12 md:py-12 md:pb-16 lg:py-16 lg:pb-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-balance font-sans text-4xl font-bold tracking-tight text-foreground lg:text-6xl md:text-6xl">
            We Love Dogs
          </h1>

          <div className="mb-8 flex justify-center">
            <LoberFinal className="h-auto w-full max-w-2xl" />
          </div>

          <p className="text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            We're Brandon and Sergio—friends from Costa Rica, tech builders, and lifelong dog
            lovers. We grew up surrounded by incredible people rescuing and caring for dogs with
            little help or recognition. We knew we could do more. So we created WeLoveDogs—a place
            powered by technology, transparency, and storytelling, built to amplify the heroes and
            the dogs they fight for every day.
          </p>
        </div>
      </div>
    </section>
  );
}
