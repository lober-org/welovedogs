import Image from "next/image";
import { Shield, Heart, Sparkles, CheckCircle, Megaphone, TrendingUp } from "lucide-react";

export default function HowWeWorkPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Clean white background like About Us */}
      <section className="relative overflow-hidden bg-white">
        <div className="container relative z-10 mx-auto px-4 py-8 pb-12 md:py-12 md:pb-16 lg:py-16 lg:pb-20">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-balance font-sans text-4xl font-bold tracking-tight text-foreground lg:text-6xl md:text-6xl">
              Support You Can See. Impact You Can Trust.
            </h1>

            <p className="text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
              Transparent, secure, and story-driven support for dogs and their heroes. We use
              technology with purpose to connect compassionate donors with the heroes saving lives
              every day.
            </p>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-50 to-white py-16 md:py-20 lg:py-24">
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            {/* Main Value Props */}
            <div className="mb-16 grid gap-8 md:grid-cols-2 md:gap-10">
              {/* Mission */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md md:p-10">
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-purple-600 to-purple-400"></div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-full bg-purple-100 p-3">
                    <Heart className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-sans text-2xl font-bold text-purple-900">Our Mission</h3>
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  A platform that supports dogs and the heroes who rescue them. By connecting
                  compassionate donors with veterinarians, shelters, and independent rescuers, we
                  create a community where every dog gets the care and love they deserve.
                </p>
              </div>

              {/* Transparency */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md md:p-10">
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-600 to-blue-400"></div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-3">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-sans text-2xl font-bold text-blue-900">Transparency</h3>
                </div>
                <p className="leading-relaxed text-muted-foreground mb-3">
                  Donations are tracked on blockchain for clear auditing. Donors can see exactly
                  where their money goes, from medical treatments to food and shelter costs.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Real-time donation tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Blockchain-verified records</span>
                  </li>
                </ul>
              </div>

              {/* Storytelling */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md md:p-10">
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-yellow-600 to-yellow-400"></div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-full bg-yellow-100 p-3">
                    <Sparkles className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="font-sans text-2xl font-bold text-yellow-900">Storytelling</h3>
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  AI helps present each hero's story in a warm, engaging way. Every dog profile and
                  care provider journey is crafted to connect emotionally with donors, making it
                  easy to understand the impact of each contribution.
                </p>
              </div>

              {/* Safety & Trust */}
              <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md md:p-10">
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-green-600 to-green-400"></div>
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-3">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-sans text-2xl font-bold text-green-900">Safety & Trust</h3>
                </div>
                <p className="leading-relaxed text-muted-foreground mb-3">
                  Verification steps for vets, shelters, and independent rescuers ensure trust and
                  safety.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">License verification for vets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Documentation review for shelters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Expense proof requirements</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Support & Visibility - Full Width */}
            <div className="mb-16 rounded-3xl bg-gradient-to-br from-pink-100 to-pink-50 p-8 md:p-12">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full bg-pink-500 p-3">
                  <Megaphone className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-sans text-2xl font-bold text-pink-900 md:text-3xl">
                  Support & Visibility
                </h3>
              </div>
              <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                Tools for heroes to request help, plus a media kit for promoting their causes.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-pink-600 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Easy campaign creation for individual dogs
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-pink-600 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">Social media sharing tools</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-pink-600 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">Media kit resources</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-pink-600 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Real-time updates and donor engagement
                  </span>
                </div>
              </div>
            </div>

            {/* CTA Card - Ready to Make a Difference */}
            <div className="rounded-3xl bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-center text-white shadow-xl md:p-12 paw-pattern-bg">
              <h2 className="mb-4 font-sans text-3xl font-bold md:text-4xl">
                Ready to Make a Difference?
              </h2>
              <p className="mb-8 text-lg leading-relaxed md:text-xl">
                Join our community of heroes and supporters making a real impact in the lives of
                dogs in need.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <a
                  href="/register/donor"
                  className="rounded-lg bg-white px-8 py-3 font-semibold text-purple-600 transition-transform hover:scale-105 hover:shadow-lg"
                >
                  Become a Donor
                </a>
                <a
                  href="/register/care-provider"
                  className="rounded-lg border-2 border-white bg-transparent px-8 py-3 font-semibold text-white transition-all hover:bg-white hover:text-purple-600"
                >
                  Register as a Hero
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
