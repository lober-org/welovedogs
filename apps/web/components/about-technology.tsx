export function AboutTechnology() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-purple-50 to-white py-16 md:py-20 lg:py-24">
      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center md:mb-20">
            <h2 className="mb-6 font-sans text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Technology with purpose, not hype
            </h2>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              We never wanted to use tech just to sound innovative. We chose it because it actually
              solves problems for the people helping dogs every day.
            </p>
          </div>

          <div className="mb-20 grid gap-8 md:grid-cols-2 md:gap-10">
            {/* Blockchain Section */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md md:p-10">
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-purple-600 to-purple-400"></div>
              <h3 className="mb-4 font-sans text-2xl font-bold text-purple-900 md:text-3xl">
                Blockchain for trust and transparency
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                Every donation and campaign on WeLoveDogs is traceable, clear, and verifiable. No
                guesswork, no doubts, no black box. Supporters can see where help goes, care
                providers can operate with credibility, and dogs get what was given to them—period.
              </p>
            </div>

            {/* AI Section */}
            <div className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md md:p-10">
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-purple-600 to-purple-400"></div>
              <h3 className="mb-4 font-sans text-2xl font-bold text-purple-900 md:text-3xl">
                AI for voices that deserve to be heard
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                Dog care providers save lives, but often don't have the time, tools, or energy to
                tell their stories. Our AI helps turn real rescue details into powerful narratives
                that connect with people—not to replace their voice, but to amplify it.
              </p>
            </div>
          </div>

          <div className="mb-20 rounded-3xl bg-gradient-to-br from-purple-100 to-purple-50 p-8 md:p-12 lg:p-16">
            <h3 className="mb-10 text-center font-sans text-3xl font-bold text-purple-900 md:text-4xl">
              What this means in real life
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-600">
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                </div>
                <p className="text-lg leading-relaxed text-foreground">
                  More support for care providers who are doing the work
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-600">
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                </div>
                <p className="text-lg leading-relaxed text-foreground">
                  More visibility for dogs who need urgent help
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-600">
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                </div>
                <p className="text-lg leading-relaxed text-foreground">
                  More trust from donors who want to help the right way
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-600">
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                </div>
                <p className="text-lg leading-relaxed text-foreground">
                  More stories that move people into action
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stellar Section - Black Background */}
      <div className="bg-black py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 md:flex-row md:gap-16">
            {/* Left: Stellar Logo */}
            <div className="flex-shrink-0">
              <img
                src="/images/design-mode/stellar-xlm-logo.png"
                alt="Stellar logo"
                className="h-32 w-32 md:h-40 md:w-40 lg:h-48 lg:w-48 brightness-0 invert"
              />
            </div>

            {/* Right: Content */}
            <div className="flex-1 text-white">
              <h3 className="mb-6 font-sans text-3xl font-bold md:text-4xl lg:text-5xl">
                Built on Stellar
              </h3>
              <p className="mb-8 text-lg leading-relaxed text-gray-300 md:text-xl">
                We chose Stellar because donations should move the same way care does — fast,
                direct, and without friction. Stellar makes every contribution traceable and
                transparent, so supporters can see exactly where help goes, and care providers
                receive funds without delays or unnecessary fees.
              </p>

              <h4 className="mb-4 font-sans text-2xl font-bold md:text-3xl">
                Real impact, not hype
              </h4>
              <p className="text-lg leading-relaxed text-gray-300 md:text-xl">
                Stellar was created to make financial access fair and open. That mission aligns with
                ours: make it easier for people to support dogs in need, no matter where they are.
                With Stellar, the focus stays on what matters — getting help to the dogs who need
                it.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final Message Section */}
      <div className="bg-gradient-to-b from-white to-purple-50 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl text-center">
            <h3 className="mb-6 font-sans text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
              Technology isn't the mission. Helping dogs is.
            </h3>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Tech is just the bridge that finally makes it work better—for them, and for the humans
              who never gave up on them.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
