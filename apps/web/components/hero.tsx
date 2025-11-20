"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  const scrollToMatchMe = () => {
    const matchMeSection = document.getElementById("match-me-section");
    if (matchMeSection) {
      matchMeSection.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="container relative z-10 mx-auto px-4 py-4 pb-0 md:py-6 md:pb-0 lg:py-8 lg:pb-0">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-1 text-balance font-sans text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            We love dogs. And we know you do too.
          </h1>

          <div className="flex justify-center -my-4 mb-4">
            <Image
              src="/images/design-mode/banner-123.png"
              alt="Cartoon dogs illustration"
              width={1200}
              height={300}
              className="w-full max-w-5xl h-auto object-cover"
              priority
            />
          </div>

          <p className="mt-2 mb-8 text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            WeLoveDogs exists to make sure dogs in need get the care they deserve—medical help,
            safety, recovery, and a real chance at life. Every dog here has a story. With your
            support, they get a better ending.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={scrollToMatchMe}
            >
              Start Donating
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">Learn Our Story</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="pb-12 md:pb-16 lg:pb-20" />
    </section>
  );
}
