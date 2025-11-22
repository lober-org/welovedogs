"use client";

interface StoryQuestionCardProps {
  question: string;
  answer: string;
  index: number;
}

export function StoryQuestionCard({ question, answer, index }: StoryQuestionCardProps) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg border-2 border-purple-200 p-6">
      <h3 className="text-base font-bold text-purple-700 mb-3">
        {index + 1}. {question}
      </h3>
      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
        {answer || "No answer provided yet."}
      </p>
    </div>
  );
}
