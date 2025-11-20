"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Heart, ChevronDown, LogOut, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { useWalletsKit } from "@/hooks/useWalletsKit";
import { CopyButton } from "@/components/ui/copy-button";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<"donor" | "care-provider" | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createBrowserClient();
  const { address, openModalAndConnect, disconnect, isConnected } = useWalletsKit();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          setUser(authUser);

          const { data: donorData } = await supabase
            .from("donors")
            .select("id")
            .eq("auth_user_id", authUser.id)
            .maybeSingle();

          if (donorData) {
            setUserType("donor");
          } else {
            const { data: providerData } = await supabase
              .from("care_providers")
              .select("id")
              .eq("auth_user_id", authUser.id)
              .maybeSingle();

            if (providerData) {
              setUserType("care-provider");
            }
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserType(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-green-700 bg-green-600 shadow-md">
      <div className="mx-auto flex h-16 md:h-20 max-w-[1600px] items-center justify-between px-3 md:px-4 lg:px-6 gap-2">
        <Link href="/" className="shrink-0 hover:opacity-90 transition-opacity">
          <img
            src="/images/design-mode/header-20logo-202.png"
            alt="WE DOGS"
            className="h-12 md:h-14 lg:h-16 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex flex-1 items-center justify-center gap-4 xl:gap-6 mx-4">
          <Link
            href="/donate"
            className="font-sans text-sm xl:text-base font-semibold tracking-wide text-white transition-colors hover:text-green-100 whitespace-nowrap"
          >
            Donate
          </Link>
          <Link
            href="/care-providers"
            className="font-sans text-sm xl:text-base font-semibold tracking-wide text-white transition-colors hover:text-green-100 whitespace-nowrap"
          >
            Heroes
          </Link>
          <Link
            href="/how-we-work"
            className="font-sans text-sm xl:text-base font-semibold tracking-wide text-white transition-colors hover:text-green-100 whitespace-nowrap"
          >
            How We Work
          </Link>
          <Link
            href="/about"
            className="font-sans text-sm xl:text-base font-semibold tracking-wide text-white transition-colors hover:text-green-100 whitespace-nowrap"
          >
            About Us
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {!loading && user && userType ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="bg-white text-green-600 hover:bg-green-50 font-semibold px-3 h-9 text-xs xl:text-sm whitespace-nowrap"
                >
                  <User className="h-4 w-4 mr-2" />
                  My Account
                  <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="px-2 py-1.5 text-sm font-medium">{user.email}</div>
                <DropdownMenuSeparator />

                {/* Wallet Section */}
                <div className="px-2 py-1.5">
                  {isConnected ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-medium text-gray-700">
                            Wallet Connected
                          </span>
                        </div>
                        <CopyButton value={address || ""} className="h-6 w-6" />
                      </div>
                      <div className="text-xs font-mono text-gray-600 break-all px-1">
                        {address}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-xs h-7"
                        onClick={() => {
                          disconnect();
                        }}
                      >
                        Disconnect Wallet
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-7"
                      onClick={openModalAndConnect}
                    >
                      <Wallet className="h-3 w-3 mr-1.5" />
                      Connect Wallet
                    </Button>
                  )}
                </div>

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${userType}`} className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                {userType === "care-provider" && (
                  <DropdownMenuItem asChild>
                    <Link href="/profile/care-provider/create-campaign" className="cursor-pointer">
                      <Heart className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                className="bg-white text-green-600 hover:bg-green-50 font-semibold px-3 h-9 text-xs xl:text-sm"
                asChild
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Actions */}
        <div className="flex items-center gap-1.5 lg:hidden">
          {!loading && user && userType ? (
            <button
              type="button"
              onClick={() => router.push(`/profile/${userType}`)}
              className="flex items-center justify-center h-8 w-8 text-white hover:bg-green-700 rounded-md transition-colors"
              aria-label="My profile"
            >
              <User className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/sign-in")}
              className="flex items-center justify-center h-8 w-8 text-white hover:bg-green-700 rounded-md transition-colors"
              aria-label="Sign in"
            >
              <User className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white p-1.5 hover:bg-green-700 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-green-700 bg-green-600">
          <nav className="container mx-auto flex flex-col px-4 py-3 space-y-2">
            <Link
              href="/donate"
              className="font-sans text-base font-semibold tracking-wide text-white transition-all duration-200 hover:translate-x-2 hover:text-green-50 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Donate
            </Link>
            <Link
              href="/care-providers"
              className="font-sans text-base font-semibold tracking-wide text-white transition-all duration-200 hover:translate-x-2 hover:text-green-50 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Heroes
            </Link>
            <Link
              href="/how-we-work"
              className="font-sans text-base font-semibold tracking-wide text-white transition-all duration-200 hover:translate-x-2 hover:text-green-50 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              How We Work
            </Link>
            <Link
              href="/about"
              className="font-sans text-base font-semibold tracking-wide text-white transition-all duration-200 hover:translate-x-2 hover:text-green-50 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <div className="border-t border-green-700 pt-2 space-y-2">
              {!loading && user && userType ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-green-600"
                    asChild
                  >
                    <Link href={`/profile/${userType}`} onClick={() => setMobileMenuOpen(false)}>
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </Link>
                  </Button>
                  {userType === "care-provider" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-green-600"
                      asChild
                    >
                      <Link
                        href="/profile/care-provider/create-campaign"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Create Campaign
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border border-red-400/30 bg-red-500/10 text-white backdrop-blur-sm hover:bg-red-500 hover:text-white"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    className="w-full bg-white text-green-600 hover:bg-green-50"
                    asChild
                  >
                    <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
