"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, User, Phone, MapPin, Check, ChevronsUpDown, Wallet } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@/lib/supabase/client";

const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "East Timor",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "North Korea",
  "South Korea",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Macedonia",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Swaziland",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

export default function DonorRegistrationPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    country: "",
    stellarAddress: "",
    profilePhoto: null as File | null, // Add profile photo field
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  useEffect(() => {
    async function getUser() {
      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in?redirect=/select-user-type");
        return;
      }

      setUserEmail(user.email || "");
      setIsLoading(false);
    }

    getUser();
  }, [router]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({ ...prev, profilePhoto: file }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("You must be signed in to register as a donor");
        router.push("/sign-in");
        return;
      }

      let profilePhotoUrl = null;
      if (formData.profilePhoto) {
        const fileExt = formData.profilePhoto.name.split(".").pop();
        const fileName = `${user.id}/profile.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(fileName, formData.profilePhoto, {
            upsert: true,
            contentType: formData.profilePhoto.type,
          });

        if (uploadError) {
          console.error("Error uploading profile photo:", uploadError);
          alert("Failed to upload profile photo. Please try again.");
          setIsSubmitting(false);
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("profile-photos").getPublicUrl(fileName);

        profilePhotoUrl = publicUrl;
      }

      const { error } = await supabase.from("donors").insert({
        auth_user_id: user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: userEmail,
        phone: formData.phone || null,
        country: formData.country || null,
        stellar_address: formData.stellarAddress || null,
        profile_picture: profilePhotoUrl, // Store the Supabase Storage URL
        profile_complete: true,
        dogs_supported: 0,
        total_donations: 0,
      });

      if (error) {
        console.error("Error creating donor profile:", error);
        alert("Failed to create donor profile. Please try again.");
        setIsSubmitting(false);
        return;
      }

      alert("Registration successful! Welcome to our community of donors.");
      router.push("/profile/donor");
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50/30 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-50/30 to-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 20c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm-10 5c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm20 0c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zm-10 15c-4.4 0-8-2.7-8-6 0-2.2 1.8-4 4-4h8c2.2 0 4 1.8 4 4 0 3.3-3.6 6-8 6z' fill='%237c3aed' fillRule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container relative mx-auto px-3 md:px-4 py-4 md:py-8">
        <Button
          variant="ghost"
          className="mb-4 md:mb-6 text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-sm md:text-base"
          asChild
        >
          <Link href="/select-user-type">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>

        <div className="mx-auto max-w-2xl">
          <Card className="border-2 border-purple-200 shadow-xl">
            <CardHeader className="space-y-3 md:space-y-4 text-center pb-4 md:pb-6 px-4 md:px-6">
              <div className="mx-auto flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600">
                <Heart className="h-7 w-7 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-purple-900">
                  Complete Your Donor Profile
                </CardTitle>
                <CardDescription className="mt-2 text-sm md:text-base text-gray-600">
                  Signed in as: <strong>{userEmail}</strong>
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="px-4 md:px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-base md:text-lg font-semibold text-purple-900">
                    Personal Information
                  </h3>

                  <div className="grid gap-3 md:gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="firstName" className="text-gray-700 text-sm md:text-base">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) => handleChange("firstName", e.target.value)}
                          className={`pl-10 h-10 md:h-11 text-sm md:text-base ${errors.firstName ? "border-red-500" : ""}`}
                        />
                      </div>
                      {errors.firstName && (
                        <p className="text-xs md:text-sm text-red-500">{errors.firstName}</p>
                      )}
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="lastName" className="text-gray-700 text-sm md:text-base">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={(e) => handleChange("lastName", e.target.value)}
                          className={`pl-10 h-10 md:h-11 text-sm md:text-base ${errors.lastName ? "border-red-500" : ""}`}
                        />
                      </div>
                      {errors.lastName && (
                        <p className="text-xs md:text-sm text-red-500">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="profilePhoto" className="text-gray-700 text-sm md:text-base">
                      Profile Photo (Optional)
                    </Label>
                    <div className="mt-2">
                      <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-purple-500/50 transition-colors">
                        <User className="mr-2 h-5 w-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formData.profilePhoto?.name || "Choose a profile photo"}
                        </span>
                        <input
                          id="profilePhoto"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-base md:text-lg font-semibold text-purple-900">
                    Contact Information (Optional)
                  </h3>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 text-sm md:text-base">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="pl-10 h-10 md:h-11 text-sm md:text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="country" className="text-gray-700 text-sm md:text-base">
                      Country
                    </Label>
                    <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={countryOpen}
                          className="w-full justify-between pl-10 font-normal bg-transparent h-10 md:h-11 text-sm md:text-base"
                        >
                          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <span
                            className={cn("truncate", !formData.country && "text-muted-foreground")}
                          >
                            {formData.country || "Select country..."}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[calc(100vw-2rem)] sm:w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search country..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                              {COUNTRIES.map((country) => (
                                <CommandItem
                                  key={country}
                                  value={country}
                                  onSelect={(currentValue) => {
                                    handleChange(
                                      "country",
                                      currentValue === formData.country.toLowerCase() ? "" : country
                                    );
                                    setCountryOpen(false);
                                  }}
                                  className="text-sm"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.country === country ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {country}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-base md:text-lg font-semibold text-purple-900">
                    Blockchain Wallet (Optional)
                  </h3>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="stellarAddress" className="text-gray-700 text-sm md:text-base">
                      Stellar Wallet Address
                    </Label>
                    <p className="text-xs md:text-sm text-gray-500 mb-2">
                      Add your Stellar wallet address to receive donation receipts on the blockchain
                    </p>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="stellarAddress"
                        placeholder="G... (Stellar address)"
                        value={formData.stellarAddress}
                        onChange={(e) => handleChange("stellarAddress", e.target.value)}
                        className="pl-10 h-10 md:h-11 text-sm md:text-base font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 md:pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-purple-900 hover:from-yellow-300 hover:via-yellow-200 hover:to-yellow-300 font-bold text-base md:text-lg h-11 md:h-12"
                  >
                    {isSubmitting ? "Saving Profile..." : "Complete Registration"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
