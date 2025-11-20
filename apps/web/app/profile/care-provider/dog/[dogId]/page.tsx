import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DogEditClient from "./DogEditClient";

export default async function DogEditPage({ params }: { params: Promise<{ dogId: string }> }) {
  const { dogId } = await params;
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Fetch the dog data
  const { data: dog, error } = await supabase.from("dogs").select("*").eq("id", dogId).single();

  if (error || !dog) {
    redirect("/profile/care-provider");
  }

  // Verify this dog belongs to the current care provider
  const { data: careProvider } = await supabase
    .from("care_providers")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!careProvider || dog.care_provider_id !== careProvider.id) {
    redirect("/profile/care-provider");
  }

  return <DogEditClient dog={dog} />;
}
