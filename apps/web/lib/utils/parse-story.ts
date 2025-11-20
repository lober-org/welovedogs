export interface StoryQA {
  question: string;
  answer: string;
}

export function parseStory(
  story: string | null,
  type: "veterinarian" | "shelter" | "rescuer"
): StoryQA[] {
  if (!story) return [];

  const questions = getQuestions(type);
  const answers = story.split("\n\n").filter((a) => a.trim());

  return questions.map((question, index) => ({
    question,
    answer: answers[index] || "",
  }));
}

function getQuestions(type: "veterinarian" | "shelter" | "rescuer"): string[] {
  if (type === "veterinarian") {
    return [
      "What inspired you to become a veterinarian, and how did you get involved with rescue cases?",
      "What kind of medical support do you usually provide to rescued dogs?",
      "What do you find most meaningful about helping injured or abandoned dogs?",
      "What's the biggest challenge you face when helping dogs in need?",
      "What motivates you to continue supporting rescue efforts?",
    ];
  } else if (type === "shelter") {
    return [
      "When and why was your shelter/organization founded?",
      "What is your mission in a few words?",
      "What kind of work does your team do every day to care for the dogs?",
      "How many dogs do you care for on average, and what kind of support do they need most?",
      "What do you dream your shelter could achieve with more help?",
    ];
  } else {
    return [
      "How did your journey as a dog rescuer begin?",
      "What motivates you to keep rescuing dogs, even during difficult moments?",
      "What does a normal rescue day look like for you?",
      "What kind of help do you usually provide to dogs (medical care, shelter, adoption, etc.)?",
      "What is your biggest dream or goal for the dogs you rescue?",
    ];
  }
}
