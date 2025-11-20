"use server";

import { createServerClient } from "@/lib/supabase/server";

export async function updateQuestProgress(donorId: string) {
  const supabase = await createServerClient();

  // Get donor's transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("donor_id", donorId);

  if (!transactions || transactions.length === 0) {
    return { success: true, message: "No transactions to process" };
  }

  // Calculate stats
  const totalDonations = transactions.reduce((sum, tx) => sum + Number(tx.usd_value || 0), 0);
  const donationCount = transactions.length;
  const maxSingleDonation = Math.max(...transactions.map((tx) => Number(tx.usd_value || 0)));
  const uniqueDogs = new Set(transactions.map((tx) => tx.dog_id)).size;

  // Get all active quests
  const { data: quests } = await supabase.from("quests").select("*").eq("is_active", true);

  if (!quests) {
    return { error: "Failed to fetch quests" };
  }

  // Update progress for each quest
  for (const quest of quests) {
    let progress = 0;

    switch (quest.requirement_type) {
      case "total_donations":
        progress = totalDonations;
        break;
      case "donation_count":
        progress = donationCount;
        break;
      case "single_donation":
        progress = maxSingleDonation;
        break;
      case "unique_dogs":
        progress = uniqueDogs;
        break;
      default:
        progress = 0;
    }

    const isCompleted = progress >= quest.requirement_value;

    // Upsert quest progress
    const { error: progressError } = await supabase.from("donor_quest_progress").upsert(
      {
        donor_id: donorId,
        quest_id: quest.id,
        current_progress: progress,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "donor_id,quest_id",
      }
    );

    if (progressError) {
      console.error("Error updating quest progress:", progressError);
    }

    // If completed and no achievement exists, create one
    if (isCompleted) {
      const { data: existingAchievement } = await supabase
        .from("donor_achievements")
        .select("id")
        .eq("donor_id", donorId)
        .eq("quest_id", quest.id)
        .maybeSingle();

      if (!existingAchievement) {
        const { error: achievementError } = await supabase.from("donor_achievements").insert({
          donor_id: donorId,
          quest_id: quest.id,
          earned_at: new Date().toISOString(),
          metadata: {
            progress: progress,
            requirement: quest.requirement_value,
            points: quest.points,
          },
        });

        if (achievementError) {
          console.error("Error creating achievement:", achievementError);
        }
      }
    }
  }

  // Update donor's total donations and dogs supported
  const { error: donorUpdateError } = await supabase
    .from("donors")
    .update({
      total_donations: totalDonations,
      dogs_supported: uniqueDogs,
      updated_at: new Date().toISOString(),
    })
    .eq("id", donorId);

  if (donorUpdateError) {
    console.error("Error updating donor stats:", donorUpdateError);
  }

  return { success: true, message: "Quest progress updated" };
}
