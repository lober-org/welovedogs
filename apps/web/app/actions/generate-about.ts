"use server";

export async function generateAboutFromStory(
  storyQA: { question: string; answer: string }[],
  providerType: "veterinarian" | "shelter" | "rescuer"
) {
  try {
    // Temporarily disabled AI generation due to module resolution issues
    // Will need to configure the AI SDK properly or use a different approach
    throw new Error(
      "AI generation is temporarily disabled. Please manually enter your About section."
    );
  } catch (error) {
    console.error("Error in generateAboutFromStory:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to generate about section");
  }
}
