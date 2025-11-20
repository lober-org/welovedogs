"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SelectUserTypePage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<"donor" | "care-provider" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/sign-in");
      } else {
        setUserId(user.id);
      }
    };
    checkUser();
  }, [router, supabase]);

  const handleContinue = () => {
    if (!selectedType) return;

    setIsLoading(true);
    // Redirect to appropriate registration form
    if (selectedType === "donor") {
      router.push(`/register/donor?userId=${userId}`);
    } else {
      router.push(`/register/care-provider?userId=${userId}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50 paw-pattern-bg">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-3xl font-bold">
              <span className="text-purple-600">WE</span>
              <Heart className="h-8 w-8 fill-red-500 text-red-500" />
              <span className="text-purple-600">DOGS</span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">One more step to get started</p>
          </div>

          <Card className="border-2 border-purple-200 shadow-xl">
            <CardHeader className="space-y-1 bg-gradient-to-br from-purple-100 via-purple-50 to-white text-center pb-8">
              <CardTitle className="text-2xl md:text-3xl font-bold">
                Welcome to WE ❤️ DOGS!
              </CardTitle>
              <CardDescription className="text-base">
                How would you like to help dogs in need?
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid gap-6 md:grid-cols-2 mb-8">
                {/* Donor Option */}
                <button
                  onClick={() => setSelectedType("donor")}
                  className={`p-8 rounded-xl border-2 transition-all hover:shadow-lg text-left ${
                    selectedType === "donor"
                      ? "border-purple-500 bg-purple-50 shadow-lg"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="text-6xl">💝</div>
                    <div>
                      <h3 className="font-bold text-xl mb-2 text-purple-900">I want to donate</h3>
                      <p className="text-sm text-gray-600">
                        Support dogs in need by contributing to their medical care, recovery, and
                        well-being. Track your impact and see the difference you make.
                      </p>
                    </div>
                    <div className="pt-2">
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-purple-600">
                        <span>Become a Donor</span>
                        {selectedType === "donor" && <ArrowRight className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Care Provider Option */}
                <button
                  onClick={() => setSelectedType("care-provider")}
                  className={`p-8 rounded-xl border-2 transition-all hover:shadow-lg text-left ${
                    selectedType === "care-provider"
                      ? "border-green-500 bg-green-50 shadow-lg"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="text-6xl">🦸</div>
                    <div>
                      <h3 className="font-bold text-xl mb-2 text-green-900">I'm a care provider</h3>
                      <p className="text-sm text-gray-600">
                        Are you a veterinarian, shelter, or rescuer? Join us to get funding support
                        for the dogs you're helping and share your impact stories.
                      </p>
                    </div>
                    <div className="pt-2">
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-green-600">
                        <span>Register as Hero</span>
                        {selectedType === "care-provider" && <ArrowRight className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleContinue}
                  disabled={!selectedType || isLoading}
                  className="w-full md:w-auto px-12 h-12 text-lg bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold hover:from-yellow-500 hover:to-yellow-600 shadow-md"
                >
                  {isLoading ? "Loading..." : "Continue"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
