"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check, Upload, Heart, Wallet } from "lucide-react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";

type HeroType = "veterinarian" | "shelter" | "rescuer" | null;

export default function RegisterCareProvider() {
  const [step, setStep] = useState(2);
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [heroType, setHeroType] = useState<HeroType>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    profilePhoto: null as File | null,
    country: "",
    city: "",
    phone: "",
    proofDocument: null as File | null,
    clinicName: "",
    orgName: "",
    contactPerson: "",
    orgDescription: "",
    website: "",
    facebook: "",
    instagram: "",
    twitter: "",
    stellarAddress: "",
    about: "",
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
  });

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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async () => {
    try {
      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("You must be signed in to register as a care provider");
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
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("profile-photos").getPublicUrl(fileName);

        profilePhotoUrl = publicUrl;
      }

      const careProviderData = {
        auth_user_id: user.id,
        name: heroType === "shelter" ? formData.orgName : formData.fullName,
        email: userEmail,
        type: heroType,
        phone: formData.phone || null,
        city: formData.city,
        country: formData.country,
        state: null,
        location: `${formData.city}, ${formData.country}`,
        clinic_name: heroType === "veterinarian" ? formData.clinicName : null,
        org_name: heroType === "shelter" ? formData.orgName : null,
        contact_person: heroType === "shelter" ? formData.contactPerson : null,
        org_description: heroType === "shelter" ? formData.orgDescription : null,
        about: formData.about || null,
        story: `${formData.question1}\n\n${formData.question2}\n\n${formData.question3}\n\n${formData.question4}\n\n${formData.question5}`,
        website: formData.website || null,
        social_media: {
          facebook: formData.facebook || null,
          instagram: formData.instagram || null,
          twitter: formData.twitter || null,
        },
        stellar_address: formData.stellarAddress || null,
        profile_photo: profilePhotoUrl,
        profile_complete: true,
        dogs_helped: 0,
        total_received: 0,
        total_spent: 0,
      };

      const { error } = await supabase.from("care_providers").insert(careProviderData);

      if (error) {
        console.error("Error creating care provider profile:", error);
        alert("Failed to create profile. Please try again.");
        return;
      }

      alert("Registration successful! Welcome to our community of heroes.");
      router.push("/profile/care-provider");
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const getQuestions = () => {
    if (heroType === "veterinarian") {
      return [
        "What inspired you to become a veterinarian, and how did you get involved with rescue cases?",
        "What kind of medical support do you usually provide to rescued dogs?",
        "What do you find most meaningful about helping injured or abandoned dogs?",
        "What's the biggest challenge you face when helping dogs in need?",
        "What motivates you to continue supporting rescue efforts?",
      ];
    } else if (heroType === "shelter") {
      return [
        "When and why was your shelter/organization founded?",
        "What is your mission in a few words?",
        "What kind of work does your team do every day to care for the dogs?",
        "How many dogs do you care for on average, and what kind of support do they need most?",
        "What do you dream your shelter could achieve with more help?",
      ];
    } else if (heroType === "rescuer") {
      return [
        "How did your journey as a dog rescuer begin?",
        "What motivates you to keep rescuing dogs, even during difficult moments?",
        "What does a normal rescue day look like for you?",
        "What kind of help do you usually provide to dogs (medical care, shelter, adoption, etc.)?",
        "What is your biggest dream or goal for the dogs you rescue?",
      ];
    }
    return [];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen paw-pattern-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen paw-pattern-bg">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    step >= s + 1
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > s + 1 ? <Check className="h-5 w-5" /> : s}
                </div>
                {s < 2 && (
                  <div className={`w-16 h-1 mx-2 ${step > s + 1 ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Step {step - 1} of 2 • Signed in as: <strong>{userEmail}</strong>
            </p>
          </div>
        </div>

        <Card className="shadow-2xl border-2 border-primary/20 overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5 border-b-2 border-primary/20 m-0">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl md:text-3xl">Join Our Mission</CardTitle>
                <CardDescription className="text-base">
                  {step === 2 && "Select your hero type"}
                  {step === 3 && "Complete your profile"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8">
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    What Type of Hero Are You?
                  </h3>
                  <p className="text-muted-foreground">
                    Select the category that best describes your role
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <button
                    onClick={() => setHeroType("veterinarian")}
                    className={`p-6 rounded-lg border-2 transition-all hover:shadow-lg ${
                      heroType === "veterinarian"
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">🩺</div>
                      <h4 className="font-bold text-lg mb-2">Veterinarian</h4>
                      <p className="text-sm text-muted-foreground">
                        Medical professionals providing healthcare to rescued dogs
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setHeroType("shelter")}
                    className={`p-6 rounded-lg border-2 transition-all hover:shadow-lg ${
                      heroType === "shelter"
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">🏠</div>
                      <h4 className="font-bold text-lg mb-2">Shelter / Organization</h4>
                      <p className="text-sm text-muted-foreground">
                        Organizations providing shelter and care for rescued dogs
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => setHeroType("rescuer")}
                    className={`p-6 rounded-lg border-2 transition-all hover:shadow-lg ${
                      heroType === "rescuer"
                        ? "border-primary bg-primary/10 shadow-lg"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">🦸</div>
                      <h4 className="font-bold text-lg mb-2">Independent Rescuer</h4>
                      <p className="text-sm text-muted-foreground">
                        Individual heroes rescuing and caring for dogs in need
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {step === 3 && heroType && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">Complete Your Profile</h3>
                  <p className="text-muted-foreground">
                    Help us tell your story and verify your identity
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg text-primary">Required Information</h4>

                    {heroType === "shelter" ? (
                      <>
                        <div>
                          <Label htmlFor="orgName">Organization Name *</Label>
                          <Input
                            id="orgName"
                            placeholder="Enter organization name"
                            value={formData.orgName}
                            onChange={(e) => handleInputChange("orgName", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactPerson">Contact Person *</Label>
                          <Input
                            id="contactPerson"
                            placeholder="Full name of contact person"
                            value={formData.contactPerson}
                            onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          placeholder="Enter your full name"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          required
                        />
                      </div>
                    )}

                    {heroType === "veterinarian" && (
                      <div>
                        <Label htmlFor="clinicName">Clinic Name *</Label>
                        <Input
                          id="clinicName"
                          placeholder="Enter clinic or practice name"
                          value={formData.clinicName}
                          onChange={(e) => handleInputChange("clinicName", e.target.value)}
                          required
                        />
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="country">Country *</Label>
                        <Input
                          id="country"
                          placeholder="Your country"
                          value={formData.country}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          placeholder="Your city"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="profilePhoto">
                        Profile Photo {heroType === "shelter" ? "or Logo" : ""} *
                      </Label>
                      <div className="mt-2">
                        <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                          <Upload className="mr-2 h-5 w-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {formData.profilePhoto?.name || "Choose a file"}
                          </span>
                          <input
                            id="profilePhoto"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileChange("profilePhoto", e.target.files?.[0] || null)
                            }
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="proofDocument">Proof of Legitimacy *</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        {heroType === "veterinarian" &&
                          "Upload your certificate, license, or registration document"}
                        {heroType === "shelter" &&
                          "Upload photo of shelter or registration document"}
                        {heroType === "rescuer" && "Upload any relevant documents or photos"}
                      </p>
                      <div className="mt-2">
                        <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                          <Upload className="mr-2 h-5 w-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {formData.proofDocument?.name || "Choose a file"}
                          </span>
                          <input
                            id="proofDocument"
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) =>
                              handleFileChange("proofDocument", e.target.files?.[0] || null)
                            }
                          />
                        </label>
                      </div>
                    </div>

                    {heroType === "shelter" && (
                      <div>
                        <Label htmlFor="orgDescription">Short Description *</Label>
                        <Textarea
                          id="orgDescription"
                          placeholder="Describe your mission or community role"
                          value={formData.orgDescription}
                          onChange={(e) => handleInputChange("orgDescription", e.target.value)}
                          rows={3}
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-lg text-primary">
                      {heroType === "shelter"
                        ? "Website & Social Media *"
                        : "Social Media (Optional)"}
                    </h4>

                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <Label htmlFor="facebook">Facebook</Label>
                        <Input
                          id="facebook"
                          placeholder="facebook.com/..."
                          value={formData.facebook}
                          onChange={(e) => handleInputChange("facebook", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input
                          id="instagram"
                          placeholder="@username"
                          value={formData.instagram}
                          onChange={(e) => handleInputChange("instagram", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="twitter">X (Twitter)</Label>
                        <Input
                          id="twitter"
                          placeholder="@username"
                          value={formData.twitter}
                          onChange={(e) => handleInputChange("twitter", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-lg text-primary">Blockchain Wallet (Optional)</h4>

                    <div>
                      <Label htmlFor="stellarAddress">Stellar Wallet Address</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Add your Stellar wallet address to receive funds on the blockchain
                      </p>
                      <div className="relative">
                        <Wallet className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          id="stellarAddress"
                          placeholder="G... (Stellar address)"
                          value={formData.stellarAddress}
                          onChange={(e) => handleInputChange("stellarAddress", e.target.value)}
                          className="pl-10 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-lg text-primary mb-1">About You *</h4>
                      <p className="text-sm text-muted-foreground">
                        Write a brief introduction about yourself and your work with rescued dogs
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="about">Tell us about yourself and your mission *</Label>
                      <Textarea
                        id="about"
                        placeholder="Share your story, your passion for helping dogs, and what drives your work..."
                        value={formData.about}
                        onChange={(e) => handleInputChange("about", e.target.value)}
                        rows={5}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        This will appear in the About section of your profile
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-lg text-primary mb-1">Tell Your Story *</h4>
                      <p className="text-sm text-muted-foreground">
                        Help us understand your mission by answering these questions
                      </p>
                    </div>

                    {getQuestions().map((question, index) => (
                      <div key={index}>
                        <Label htmlFor={`question${index + 1}`}>
                          {index + 1}. {question} *
                        </Label>
                        <Textarea
                          id={`question${index + 1}`}
                          placeholder="Share your thoughts..."
                          value={
                            formData[`question${index + 1}` as keyof typeof formData] as string
                          }
                          onChange={(e) =>
                            handleInputChange(`question${index + 1}`, e.target.value)
                          }
                          rows={3}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <div>
                {step > 2 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}
                {step === 2 && (
                  <Link href="/select-user-type">
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  </Link>
                )}
              </div>

              <div>
                {step < 3 && (
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={step === 2 && !heroType}
                    className="gap-2 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-purple-900 hover:from-yellow-300 hover:via-yellow-200 hover:to-yellow-300"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
                {step === 3 && (
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      !formData.about ||
                      !formData.question1 ||
                      !formData.question2 ||
                      !formData.question3 ||
                      !formData.question4 ||
                      !formData.question5
                    }
                    className="gap-2 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-purple-900 hover:from-yellow-300 hover:via-yellow-200 hover:to-yellow-300"
                  >
                    Submit Registration
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
